# 前端十大认知冲突

因为你们已经有很多前端经验，我要做的就是替你们打通任督二脉，

把整个 前端逻辑 前端原理 讲闭环了，你们就能记住，你们就能敢写更多。

## 一个现代前端项目是怎么运行起来的?

  一句话：**前端项目和后端工程一样，是一个有依赖管理、有构建、有本地服务的标准工程**，只不过最终产物是丢给浏览器跑的 HTML/CSS/JS。下面全程对照后端来拆。

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

### 3. install —— 把依赖拉到本地

`npm install` 读 `package.json` → 从 npm 仓库下载所有依赖 → 全部塞进 `node_modules/`。

类比 `mvn install` 把 jar 拉到 `.m2`。区别是 `node_modules` 在**项目内部**，每个项目一份，所以它通常巨大（几百 MB 很正常），且**不提交到 git**。

### 4. npm run dev —— 前端工程化的基石开始工作

依赖装好后，你敲下 `npm run dev`。这条命令背后真正干活的，是一个叫 **打包工具（构建工具）** 的东西——新项目用 **Vite**，老项目多是 **Webpack**。

他的官方定义是 静态 模块 打包工具

它是整个前端工程化的基石。**没有它，你写的 `.vue`、`import`、`@/components` 浏览器一个都不认识。**
它就站在"你写的代码"和"浏览器能跑的代码"中间，既当翻译官、又当服务员。

打包工具会做**两件事**：

| 它做的事 | 解决什么问题 | 类比后端 |
|---------|------------|---------|
| ① **编译** | 浏览器看不懂 `.vue`、看不懂裸名 import | 像 javac 把 .java 编译成 .class |
| ② **反向代理** | 浏览器同源策略，前端调后端被跨域拦截 | 像 Nginx 转发请求 |

### 5. 第一件事——编译：顺着 import 把代码翻译成浏览器能跑的样子

**先看代码怎么连起来。** 每个文件顶部用 `import` 声明"我要用谁"：

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

这些 import 一层层连起来，就形成一棵**依赖树**：`main.js → App.vue → HelloWorld.vue → …`。

> import 路径只有两种：**裸名**（`'vue'`，去 node_modules 找）和**相对路径**（`'./xxx.vue'`，你自己的文件）。看到哪种，就知道它从哪来。

**打包工具从入口 `main.js` 出发，顺着 import 把整棵树爬一遍，边爬边翻译**，因为浏览器：

- 看不懂 `.vue` 文件 → 编译成普通 `.js`
- 不认识 `import 'vue'` 这种裸名 → 替换成真实路径
- 嫌文件太多太大 → 合并、压缩，删掉没用到的代码（tree-shaking）

开发时（`npm run dev`）这个编译是**实时**的：你一改代码保存，立刻重新编译并刷新页面（热更新 HMR）。

上线时（`npm run build`）则把整棵树一次性打包到 `dist/`：几个 `.js` + `.css` + 一个 `index.html`——**这才是真正部署到服务器的东西**，和你的 src 长得完全不一样。

### 6. 第二件事——反向代理：让前端能调到后端

`npm run dev` 会在本地起一个 **开发服务器**（比如 `http://localhost:5173`），浏览器访问的就是它。

但有个坎：浏览器有**同源策略**，前端页面在 `localhost:5173`，直接去调后端 `localhost:8080` 会被当成跨域**拦截**。解决办法是让开发服务器帮忙转发——这就是反向代理：

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

浏览器以为自己只在跟 `5173` 说话（同源，不拦），实际请求被悄悄转发给了后端。**这和后端用 Nginx 做反向代理是一个道理**，只是这里跑在你的开发机上。

### 7. 串起来：一次完整启动

```cmd
npm install        → 下依赖到 node_modules
npm run dev        → 打包工具启动：起本地服务(5173) + 实时编译 + 反向代理
浏览器访问 5173    → 加载 index.html → 加载 main.js → 顺着 import 跑起整个 App
改代码保存         → 自动热更新
npm run build      → 打包出 dist/，交给运维部署
```

### 关键认知：Vite/Webpack 自己也是个 npm 包，全靠 Node.js 撑着

可以理解为前端项目从源码到最终部署产物的整个构建流程，都由 Vite/Webpack 负责，撑起了整个前端工程化，你要做的仅仅是配置参数。

回头看 `package.json` 里那行 `"vite": "^5.0.0"`——**打包工具本身也是一个依赖包**，就躺在你的 `node_modules/` 里，和 vue、axios 没区别。

`npm run dev` 不过是去 node_modules 里把 vite 这个包跑起来。

而 vite、npm、编译、本地服务器、热更新、反向代理——**没有一个是浏览器干的，全是 Node.js 在你电脑上跑**；

浏览器只负责跑最终产物。记住一句话：

> **开发期是 Node 的主场，运行期才是浏览器的主场。**

这正是下一节「哪些属于 Node，哪些属于 JS」要展开的。

## 项目中哪些属于NodeJS, 哪些属于JS?

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
