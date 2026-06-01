# 前端十大认知冲突

我相信大家在日常开发中，并非没有优化代码、抽象逻辑的想法，只是常常**不会写**（不知道有哪些 API），或**不敢写**（吃不准有没有潜在的坑）。

于是大多数时候，只能退回保守写法：复制粘贴、老 API 用到底。

第一步，我要帮大家解决——**不敢写** 的问题，

接下来几节课我会 依次解答 我总结的 纯原创的 容易忽略却又最重点的 前端十大疑问，快速解决大家的困惑。

以此，将整个 前端逻辑 前端原理 讲闭环，让大家能理解，能记住。这样大家就敢写，敢优化自己的代码了。

第二步，我会从一个个知识点(ES6, Vue, React)入手, 讲他们的原理。

## 一个现代前端项目是怎么运行起来的?

给你一个前端项目，你第一个应该看的文件是哪个?

### 1. 目录结构（对照 Maven/Gradle 工程看）

```txt
my-vue-app/
├── package.json          # 等价于 pom.xml：声明依赖 + 脚本命令
├── package-lock.json     # 锁定依赖版本，等价于 Maven 依赖锁
├── vite.config.js        # 构建/本地服务配置（端口、代理、别名）
├── index.html            # 唯一入口页面（SPA 全站只有这一个 html）
├── node_modules/         # 第三方依赖的"本地仓库"，等价于 ~/.m2
├── public/               # 不参与打包、原样拷贝的静态资源
└── src/                  # 你真正写的代码都在这
    ├── main.js           # 程序入口（等价于 main 方法）
    ├── App.vue           # 根组件
    ├── components/       # 可复用组件
    │   └── HelloWorld.vue
    ├── views/            # 页面级组件
    ├── router/           # 路由表
    └── api/              # 封装后端接口请求
```

### 2. package.json —— 工程的"清单"

```jsonc
{
  "name": "my-vue-app",
  "scripts": {
    "dev": "vite",            // 启动本地开发服务器
    "build": "vite build"     // 打包出生产产物
  },
  "dependencies": {           // 运行时要用的（会进最终产物）
    "vue": "^3.4.0",
    "vue-router": "^4.3.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {        // 只在开发/打包时用（不进产物）
    "vite": "^5.0.0"
  }
}
```

- `dependencies` vs `devDependencies` ≈ Maven 的 `compile` scope vs `provided/test` scope。
- `scripts` 里的命令，用 `npm run dev` / `npm run build` 触发，等价于 Maven 的 goal。

### 3. npm install —— 依赖安装命令

读取 `package.json`，从 npm 仓库下载全部依赖，存入 `node_modules/`。

- **类比**：等价于 `mvn install` 将 jar 拉取至 `.m2`。
- **位置**：`node_modules` 在项目内部，每个项目独立一份。
- **体积**：数百 MB 属常态。
- **版本控制**：不纳入 git。

### 4. npm run dev —— 运行项目

`npm run dev` 对应 `package.json` 中 `scripts.dev`，本质是调用 **webpack / vite** 这两个包开始执行（这两个包内已写好启动脚本）。

```jsonc
// package.json
"scripts": {
  "dev": "vite",          // npm run dev → 执行 vite 包
  "build": "vite build"
}
```

执行时主要做两件事——**编译** 与 **反向代理**（分别见第 5、6 节）。

**webpack / vite 的官方定义：静态 模块 打包工具。** ：

**① 静态**：指在构建时（而非运行时）就静态分析出全部依赖关系。ES Module 的 `import` / `export`
写在顶层、可被静态扫描，打包前即能确定整张依赖图；对比 CommonJS 的 `require()` 可在运行时、条件分支里动态调用，属于动态加载。

**② 模块**：在打包工具眼中"一切皆模块"——`.vue`、`.jsx`、`.ts`、`.png`、`.css` 全是模块。不同后缀交由不同插件（webpack 称
loader、vite 称 plugin）解析，最终都转成 JS 能识别的模块，汇入产物。

| 后缀 | 解析者 | 转换为 |
|------|--------|--------|
| `.vue` | vue-loader / plugin-vue | render 函数（JS） |
| `.ts` / `.jsx` | esbuild / babel | 标准 JS |
| `.png` 等图片 | asset 模块 | 路径字符串 或 base64 |
| `.css` | css-loader | 注入 `<style>` 的 JS |

**③ 打包**：把这些模块按依赖图合并、压缩为少量产物（bundle）。

```js
// 打包前：你写的
import logo from './logo.png'
console.log(logo)

// 打包后：png 被转成最终引用
const logo = "/assets/logo.4f3a1b.png"             // 大图：拷至 dist，替换为带 hash 的路径
// 或（小图内联，省一次请求）
const logo = "data:image/png;base64,iVBORw0KG..."
console.log(logo)
```

**另外，这两者还有以下功能**，且只需简单配置即可开启：

| 功能 | 作用 |
|------|------|
| Tree-shaking | 删除未被引用的代码 |
| 代码分割 | 按路由 / 按需拆包，首屏只加载必要部分 |
| 压缩混淆 | 压缩 JS / CSS，缩小体积 |
| Source Map | 报错时映射回源码，便于调试 |
| HMR 热更新 | 改码即时刷新，无需手动刷页面 |
| 静态资源处理 | 图片压缩、hash 命名、小图内联 |
| 环境变量注入 | 区分开发 / 生产环境 |

```js
// vite.config.js —— 简单配置即可开启
export default {
  build: { minify: 'esbuild' }   // 开启压缩；tree-shaking、HMR 默认即开
}
```

### 5. 编译 —— 沿 import 翻译为浏览器可运行代码

**定义**：从入口 `main.js` 出发，沿 `import` 遍历依赖树，逐个转换。

**import 的两种路径**：

- **裸名**（`'vue'`）：去 `node_modules` 找第三方库。
- **相对路径**（`'./App.vue'`）：找自己写的文件。

```js
// src/main.js —— 入口
import { createApp } from 'vue'        // 裸名 → 去 node_modules 找 vue
import App from './App.vue'            // 相对路径 → 找你自己的组件
import router from './router'
createApp(App).use(router).mount('#app')
```

```vue
<!-- src/App.vue -->
<script setup>
import HelloWorld from './components/HelloWorld.vue'  // 引用子组件
import axios from 'axios'                              // 引用第三方库
</script>
```

**依赖树**：`main.js → App.vue → HelloWorld.vue → …`

**两种构建模式**：

- **开发（`npm run dev`）**：实时编译，保存即刷新（HMR）。
- **上线（`npm run build`）**：一次性打包至 `dist/`（若干 `.js` + `.css` + 一个 `index.html`），即部署产物，与 `src`
  形态完全不同。

### 6. 反向代理 —— 绕过同源策略调后端

**定义**：由开发服务器代为转发请求，使前端绕过浏览器同源策略。

- **问题**：页面在 `localhost:5173`，直接请求后端 `localhost:8080` 被判跨域并拦截。
- **方案**：配置 `proxy`，浏览器只与同源的 `5173` 通信，由 `5173` 转发至后端。

```js
// vite.config.js
export default {
  server: {
    proxy: {
      // 浏览器请求 /api/xxx → 开发服务器转发到 http://localhost:8080/api/xxx
      '/api': { target: 'http://localhost:8080', changeOrigin: true }
    }
  }
}
```

**原理**：与后端用 Nginx 做反向代理一致，区别仅在于此处运行于开发机。

### 7. 完整启动流程

```cmd
npm install        → 下依赖到 node_modules
npm run dev        → 打包工具启动：起本地服务(5173) + 实时编译 + 反向代理
浏览器访问 5173    → 加载 index.html → 加载 main.js → 顺着 import 跑起整个 App
改代码保存         → 自动热更新
npm run build      → 打包出 dist/，交给运维部署
```

### 8. 关键认知：Vite/Webpack 本身也是 npm 包，由 Node.js 运行

Vite/Webpack 打包工具自身就是依赖包，躺在 `node_modules/`，与 vue、axios 无异

`npm run dev`执行时, 不过也是调用了 `node_modules` 中的 vite 包。

也就是说, 上面说的一切, vite、npm、编译、本地服务器、热更新、反向代理, 本质都是NodeJS在进行支持，在单线的调用。

这就是 一个现代前端项目运行 的基石。

## 前端项目中, 哪些属于NodeJS, 哪些属于JS?

前端项目中, SRC里面和SRC外面的区别是什么?

站在项目目录的角度，分界线只有一条——`src/`：

- **`src/` 外的文件，归属 Node.js**：`vite.config.js`、`package.json`、各类 `*.config.js`、脚手架脚本。
- **`src/` 内的文件，归属浏览器 JS**：`main.js`、`App.vue`、`components/`。

两侧同为 `.js`、语法一致，但分属两个运行环境。

### 1. src 外：属于 Node.js，前端工程化的基石

**结论一：2016 年以前，JS 是纯脚本语言。** 只能内嵌 HTML 做页面交互，无前后端分离，无前端工程化，无构建打包环节。

**结论二：Node.js 将 JS 引擎从浏览器中独立出来，使其可运行在本地、服务器与桌面端。** 由此前端获得"一套语言、两类用途"的能力：

- 浏览器端：编写页面业务逻辑。
- 本地机器端：编写工程化工具——构建、打包、起服务、读写文件。

**结论三：`src` 外的文件本质是"以 JS 编写、运行于 Node、永不进入浏览器"的工程化配置。**

```js
// vite.config.js —— 运行于 Node 的 JS
import { defineConfig } from 'vite'
import path from 'node:path'          // ← Node 独家的"路径"包

export default defineConfig({
  resolve: {
    // __dirname、path 仅 Node 提供，浏览器中不存在
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  server: { port: 5173 }
})
```

```jsonc
// package.json 的 scripts：npm run dev 即在本机启动一个 node 进程
"scripts": { "dev": "vite", "build": "vite build" }
```

**定位：`src` 外 = Node.js 支撑的工程化层，运行于开发机，负责将源码加工为浏览器可用的产物。**

### 2. src 内：属于 JS，运行于浏览器

`src/` 内的业务代码，经编译打包后归宿为浏览器。

**核心结论：语言相同，运行环境不同，可调用的 API 不同。**

浏览器环境提供三套 API：

#### ① JS（ECMAScript）—— 语言核心，两环境通用

语言自身的语法与内置对象，不依赖任何环境，`src` 内外均可用：

```js
const list = [3, 1, 2]
list.sort()                    // Array
Math.max(...list)              // Math
JSON.parse('{"a":1}')          // JSON
await Promise.resolve(1)       // Promise
```

#### ② DOM（Document Object Model）—— 操作页面元素

以 `document` 为根对象，负责页面标签的增删改查；Vue/React 在底层调用的即是此套 API：

```js
const btn = document.querySelector('#submit')     // 查
btn.addEventListener('click', () => {})           // 绑事件
const div = document.createElement('div')         // 创建
document.body.appendChild(div)                     // 插入页面
```

**归属结论：`window`、`document` 为浏览器独有；在 Node 中调用 `document.querySelector` 直接报错——无页面可操作。**

#### ③ BOM（Browser Object Model）—— 操作浏览器本身

以 `window` 为全局根对象，覆盖地址、历史、存储、定时器：

```js
window.location.href            // 当前网址（路由的底层依赖，下一节展开）
window.history.back()           // 后退一页
localStorage.setItem('token', 'abc')   // 本地存储
setTimeout(() => {}, 1000)      // 定时器
navigator.userAgent             // 浏览器信息
```

#### 其余浏览器提供的宿主能力, 官方统称 Web APIs

| 类别 | 典型 API |
|------|---------|
| 网络 | `fetch`、`WebSocket`、`XMLHttpRequest`、WebRTC |
| 存储 | `IndexedDB`、Cache API、Cookie(`localStorage` 常被归 BOM) |
| 图形多媒体 | Canvas、WebGL/WebGPU、Web Audio、MediaStream |
| 并发 | Web Workers、Service Worker |
| 设备能力 | Geolocation、Notification、Clipboard、WebUSB、WebBluetooth |
| 观察者 | `IntersectionObserver`、`MutationObserver`、`ResizeObserver` |
| 性能 | Performance API、`requestAnimationFrame` |

### 3. 对照：Node.js 端提供的 API

Node 不提供 `window`、`document`，转而内置一批浏览器不具备的"系统级"包，对应文件、路径、网络、进程等能力：

| 内置包 | 能力 | 浏览器是否有 |
|--------|------|:---:|
| `fs` | 文件读写 | ✗ |
| `path` | 路径拼接与解析 | ✗ |
| `http` / `https` | 起服务器、发请求 | ✗（浏览器仅有 `fetch`，不能起服务） |
| `process` | 进程信息、环境变量、启动参数 | ✗ |
| `os` | 操作系统信息（CPU、内存、平台） | ✗ |
| `child_process` | 执行外部命令 | ✗ |
| `crypto` | 加密、哈希 | △（浏览器有受限的 Web Crypto） |

```js
import fs from 'node:fs'        // 文件读写
import path from 'node:path'    // 路径处理
import http from 'node:http'    // 起服务器

fs.readFileSync('./a.txt', 'utf-8')             // 读取本地文件
path.join(__dirname, 'src')                      // 拼路径
http.createServer((req, res) => res.end('hi'))   // 启动一个服务器
process.env.NODE_ENV                             // 读取环境变量
```

**安全结论：浏览器刻意不提供 `fs`、`child_process` 这类包，以杜绝任意网页读取本地文件或执行命令。可调用的 API由运行环境决定，而非由语言决定。**

### 小结与伏笔

| | src 外 | src 内 |
|---|--------|--------|
| 运行环境 | Node.js（本机） | 浏览器（用户端） |
| 职责 | 工程化：构建、打包、起服务 | 业务：页面逻辑、交互 |
| 独家 API | `fs`、`process`、`path` | JS + BOM(`window`) + DOM(`document`) |
| 运行时机 | 开发 / 打包期 | 用户访问页面时 |

**伏笔：在 TS 约束的 React 项目中，`src` 内外对应两套 TS 配置——`tsconfig.json` 约束 src 内的浏览器代码，`tsconfig.node.json`约束 src 外的 Node 工程化代码。**

到这里，大家写的NodeJS + Vite，将一个前端项目编译回了最原始的脚本。

接下来，将正式进入这个"脚本"主战场，JS的主战场 —— 浏览器。

## 单页面路由是怎么做到的?

## 组件并不是原生HTML标签, 却能像标签一样相互引用, 还能在浏览器上运行, 这是怎么实现的?

## this的指向?

## 备用

培训：
我觉得前端和后端最大的不同是前端的东西很好找

我能理解大家写前端束手束脚，复制粘贴，因为怕
和很多人用ai写代码是一样的
理解了原理，你就敢写了，敢抽象了

接下来，我将用最直白，最不绕弯子，最客观，最正确，最系统，最真实，最简略，最容易理解，最不卖关子的方式告诉你
不绕弯，不客套，不铺垫，最直白，最详细，最一针见血，的回答，给大家讲前端的很多本质。
第一点，前端是脚本语言，现在也是。前端在抛弃继承，抛弃class，更多转为纯函数调用。

给你们把逻辑讲闭环了，就能记住。

听完这节课之后，你们对前端的理解就超过市面上90%的前端了。

当然，你们愿意学，我也很开心，不是所有后端都愿意学前端的。我这里能保证没有废话，只讲你们会用到的干活，纯原理层面的，让你们敢用

所以我现在接手Java是有点难度的。

第0项，环境配置，vscode最新版，还有插件，下面都是我的同款配置。另外关于ai，建议大家都装个Python

写一个demo项目，大家可以玩一玩

第二点，前端叫【组件化】，抽象逻辑，有三层

前端本质是一个脚本，工程化模糊了这个概念，但本质上

1.不敢写，解释原理（本质就是嵌套调用，所以逻辑复用也是一样的道理）不要写this
2.逻辑复用，写作文，总分总。调试前端问题
3.组件接口站
下一个难点，单页面路由
另一个难点，样式
再下一个难点，TS
下一个难点，promise
下一个难点，ai（小任务，精确。本质是抽奖，对于不那么聪明的ai来说更是，不要尝试在已经生成的基础上修改，尝试在修改自己最初提示词的基础上，再次抽奖）

做得最多的事，培训 重构 代码检视。写博文

保持风格一致，老项目，老组件先那样写，新项目必须写好。老项目等我重构。

随堂测试：最后做几个随堂测试
