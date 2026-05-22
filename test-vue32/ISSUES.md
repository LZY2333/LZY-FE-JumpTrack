# 项目问题记录

> 该文档记录本项目在搭建、运行、维护过程中遇到的环境/配置问题及修复方案，便于后续排查。

---

## 1. `vite.config.js` 混用 ESM / CJS 语法导致启动失败

### 现象

在 Node 24 + Vite 2.5.2 下执行 `npm run dev` 失败：

```
failed to load config from vite.config.js
ReferenceError: require is not defined in ES module scope, you can use import instead
```

### 原文件

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const { resolve } = require('path')   // ← CJS 语法
import path from 'path'                // ← ESM 语法

export default defineConfig({
  root: path.resolve(__dirname, 'src/pages'),   // __dirname 也是 CJS-only
  ...
})
```

### 根因

1. 文件顶部包含 `import` / `export` 语句，Vite 通过 esbuild 转译后按 **ESM** 加载。
2. ESM 作用域中没有 `require`、`__dirname`、`__filename`、`module`、`exports` 这些 CJS-only 全局变量。
3. 老版 Node + 老版 esbuild 曾对混合语法宽容降级为 CJS，现代版本（Node 18+ / esbuild 0.17+）不再降级，混用直接报错。

### 临时方案（曾采用）

把配置文件改为纯 CJS：

```js
const { defineConfig } = require('vite')
const vue = require('@vitejs/plugin-vue').default
module.exports = defineConfig({ ... })
```

代价：

- 偏离社区主流写法（Vite 3+ 全部走 ESM）。
- `package.json` 不能加 `"type": "module"`，未来引入纯 ESM-only 依赖会被卡。
- 与 IDE/类型工具的 ESM 默认假设不一致。

### 最终方案（已采用）

升级 Vite 后回归现代 ESM 写法：

- `package.json` 加 `"type": "module"`。
- `vite.config.js` 使用 `import` / `export default`。
- 用 `import.meta.url` + `fileURLToPath` 取代 `__dirname`。

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const r = (p) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  root: r('./src/pages'),
  ...
})
```

---

## 2. Vite 2.5.2 与 Node 24 不兼容

### 现象

即使把配置改成纯 ESM，Vite 2.5.2 在 Node 24 上的 dev/build 仍存在边角问题（HMR client、依赖预构建的 esbuild 版本过老等）。

### 方案

升级核心构建链：

| 依赖 | 旧版 | 新版 | 说明 |
|---|---|---|---|
| `vite` | 2.5.2 | `^5.4.0` | Node 18/20/22/24 全支持 |
| `@vitejs/plugin-vue` | 1.6.0 | `^5.1.0` | 与 Vite 5 匹配 |
| `@vue/compiler-sfc` | 3.2.6 (devDep) | 移除 | `@vitejs/plugin-vue` 会用 `vue` 自带的 compiler，不需要单独声明 |
| `less` | 2.7.3 | `^4.2.0` | 老版与 Vite 5 不兼容；ant-design-vue 主题变量要求 less ≥ 3 |

Vue 运行时（`vue@3.2.8`）、`ant-design-vue@3.2.13`、`vue-router@4`、`vuex@4` 暂不动，先保证构建链可跑。

---

## 3. 多页应用的页面访问路径

`vite.config.js` 中 `root` 指向 `src/pages`，因此每个页面的访问路径是去掉 `src/pages/` 前缀的相对路径，例如：

- 源码：`src/pages/imot4/billMapping/index.html`
- 访问：`http://localhost:8002/imot4/billMapping/index.html`

构建产物 `dist/` 下的目录结构同理。

---

## 4. 待跟踪事项

- [ ] `ant-design-vue@3.2.13` 与 Vue 3.2 偏老，未来如升级到 Vue 3.4+ 需同步升级到 ant-design-vue 4.x。
- [ ] `axios@0.21.1` 存在已知 CVE，建议升级到 `^1.7.0`。
- [ ] `jquery` / `store` / `lodash.get` 等若实际未使用，建议清理。
- [ ] `npm` 作为依赖被列入 `dependencies`（`"npm": "8.19.2"`），属误加，建议移除。

---

## 5. `vue@3.2.8` 与 `@vitejs/plugin-vue@5` 的 peer 冲突

### 现象

升级 Vite 至 5.x 后 `npm install` 报 ERESOLVE：

```
peer vue@"^3.2.25" from @vitejs/plugin-vue@5.2.4
Found: vue@3.2.8
```

### 根因

原 `package.json` 中大量依赖写成精确版本号（无 `^`/`~` 前缀），其中：

```json
"vue": "3.2.8"
```

被精确锁定为 `3.2.8`。而 `@vitejs/plugin-vue@5` 的 peerDependency 要求 `vue@^3.2.25`，二者无法共存。

> 提示：原 `package.json` 中精确锁定的还有 `ant-design-vue: 3.2.13`、`axios: 0.21.1`、`vue-router: 4.1.6` 等。精确锁定通常用于复现历史构建，但会阻碍后续生态升级；建议非历史复现场景下使用 `^x.y.z` 允许补丁与次版本更新。

### 方案

把 `vue` 从 `3.2.8` 升到 `^3.4.0`：

- 3.2.x → 3.4.x 属次版本升级，**无破坏性变更**，公共 API 兼容。
- `ant-design-vue@3.2.13` peer 要求 `vue@^3.2.0`，向上兼容到 3.4 没问题。
- 同时移除原 devDependency `@vue/compiler-sfc@3.2.6`，避免与运行时 vue 版本错位（plugin-vue 内部自动使用与 `vue` 同版本的 compiler）。
