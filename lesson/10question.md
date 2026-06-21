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

## 单页面应用是怎么做到的?

### 1. 先对齐概念：多页面（MPA） vs 单页面（SPA）

后端最熟悉的是 **多页面**模型——每个 URL 对应服务器上一个真实文件 / 一个 Controller：

```txt
传统多页面（MPA）
点击 /about  → 浏览器向服务器发起 GET /about
            → 服务器返回一个全新的 about.html
            → 浏览器整页销毁、重新加载、白屏一下
```

```txt
单页面（SPA）效果是: 
点击 /about  → 不向服务器要新 html
            → JS 把页面里的一块内容换掉
            → URL 也跟着变成 /about，但页面没刷新
```

好处：不全屏刷新、状态不丢失（如已填的表单）、切换快、后端压力小、前后端分离。

其本质就是一句话: JS利用现有资源, 控制页面变化, 改变URL, 改变内容, 却不向后端发起页面请求。

### 2. 怎么做到URL改变，却不向后端发起请求?

正常情况下，只要 URL 变了，浏览器就会向服务器发请求、整页刷新。

```js
location.href = '/about'   // 浏览器立刻跳转 + 刷新，SPA 就破功了
```

全靠浏览器, 或者说浏览器提供的 BOM 中的 **Hash** 和 **History API**。

### 3. 首先是 Hash 路由

其特征是 `https://site.com/#/about`

URL 中 `#` 后面的部分叫 hash（锚点），**浏览器永远不会把它发给服务器**，且改它不会刷新页面。

```js
// 调用hash模式 的API 非常简单
location.hash = '/about'        // 地址栏变成 site.com/#/about，页面不刷新

// 监听 hash 变化（前进、后退、手动改都会触发）
window.addEventListener('hashchange', () => {
  console.log('hash 变了：', location.hash)   // "#/about"
})
```

利用这个特性，做到了 修改url 且不发送后端请求，不需要controller监听`/about`路由。

而同时JS 又能通过 监听hash变化, 切换组件, 来做到更新内容。

> 同时你会注意到, 修改URL至特定路由 与 特定路由应该展示什么组件, 两者完全解耦

### 4. History 路由

其特征是 `https://site.com/about` 和正常多页面路由完全一样, 却同样不会发送后端请求。

这个机制 依赖浏览器提供的 `history` 对象, 使用它改变url同样不会触发跳转请求。

| API | 作用 |
|------|------|
| `history.pushState(state, title, url)` | 新增一条历史记录，地址栏变为 `url`，**不刷新** |
| `history.replaceState(state, title, url)` | 替换当前历史记录（不新增），**不刷新** |
| `history.back()` / `forward()` / `go(n)` | 前进、后退、跳 n 步（等价于浏览器的 ← → 按钮） |
| `popstate` 事件 | 用户点前进/后退时触发（**注意：pushState 本身不触发它**） |

```js
// 改地址栏为 /about，不触发请求
history.pushState({ from: 'home' }, '', '/about')

// 监听浏览器前进/后退
window.addEventListener('popstate', (e) => {
  console.log('用户点了前进/后退，当前路径：', location.pathname)
  console.log('当时存的状态：', e.state)   // { from: 'home' }
})
```

URL没有 `#` 更干净更漂亮，且浏览器的前进后退按钮同样支持(hash路由也支持)。

缺点是, 用户 在地址栏按回车时 或 刷新页面时 会向后端发起 对应url 的请求(hash路由不会), 因此History路由需要后端支持。

> React-Router Vue-Router 均可在两种路由模式任选其一

### 5. Nginx配置

如果你看过现代前端项目的nginx的配置, 那么你会知道他其实只干三件事

```conf
server {
  listen 80;
  server_name app.example.com;
  root /var/www/dist;          # 打包产物目录

  # 1. 返回静态资源, 且强缓存
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # 2. 不管你去哪个子路由, 返回 index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 3. /api/ 反向代理到真后端
  location /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

所以nginx是一个前端老手必备的知识，属于前端的一部分

### 6. 再次理解SPA原理

本质就是两块:

1. 通过不触发请求的方式修改URL
2. 监听URL的变化, 拿 URL 去路由表里 match，把对应组件渲染出来。

```html
<!-- 唯一的 index.html -->
<a href="/" data-link>首页</a>
<a href="/about" data-link>关于</a>
<a href="/user/42" data-link>用户42</a>
<div id="app"></div>

<script>
// ① 路由表：路径 → 该渲染什么内容（等价于后端的 URL → Controller 映射）
const routes = {
  '/':      () => '<h1>首页</h1>',
  '/about': () => '<h1>关于我们</h1>',
}

// ② 根据当前 URL 渲染对应内容（match + render）
function render() {
  const view = routes[location.pathname] || (() => '<h1>404</h1>')
  document.querySelector('#app').innerHTML = view()
}

// ③ 拦截站内链接点击：阻止浏览器默认跳转，改用 pushState
document.addEventListener('click', (e) => {
  if (e.target.matches('a[data-link]')) {
    e.preventDefault()                       // 关键：拦下浏览器的整页跳转
    history.pushState(null, '', e.target.href) // 只改地址栏
    render()                                  // 自己换内容
  }
})

// ④ 响应浏览器前进/后退
window.addEventListener('popstate', render)

render()  // 首次进入页面，渲染一次
</script>
```

这些事情 vue-router、react-router 都帮你做好了，只需要调用API就行。

### 7. vue-router / react-router

**Vue（vue-router）：**

```js
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  { path: '/',          component: Home },
  { path: '/user/:id',  component: () => import('@/views/User.vue') }, // 懒加载
]

export default createRouter({
  history: createWebHistory(),   // history 模式；createWebHashHistory() 即 hash 模式
  routes,                        // ← 这就是上面手写版的"路由表"
})
```

```vue
<!-- App.vue -->
<router-link to="/about">关于</router-link>  <!-- 等价手写版的 <a data-link> -->
<router-view />                               <!-- 内容出口，等价 #app -->
```

**React（react-router）：**

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>                          {/* history 模式；HashRouter 即 hash */}
      <Link to="/about">关于</Link>           {/* 导航入口 */}
      <Routes>                               {/* 路由表 */}
        <Route path="/"         element={<Home />} />
        <Route path="/user/:id" element={<User />} />
      </Routes>
    </BrowserRouter>
  )
}
```

两者命名几乎一一对应：`<router-link>`↔`<Link>`、`<router-view>`↔`<Routes>`、`createWebHistory`↔`BrowserRouter`。

### 7. 路由的完整能力地图

| 能力 | vue-router | react-router | 说明 |
|------|-----------|--------------|------|
| **动态参数** | `path: '/user/:id'` | `path="/user/:id"` | URL 上的变量，如 `/user/42` |
| 读参数 | `useRoute().params.id` | `useParams().id` | 拿到 `42` |
| 读查询串 | `useRoute().query.kw` | `useSearchParams()` | `?kw=x` 的部分 |
| **编程式导航** | `useRouter().push('/about')` | `useNavigate()('/about')` | 不靠点链接，用代码跳转 |
| 替换 / 回退 | `.replace()` / `.back()` | `navigate(-1)` | 对应 `replaceState` / `history.back` |
| **嵌套路由** | `children: [...]` | 嵌套 `<Route>` | 父布局 + 子内容出口 |
| **路由守卫** | `router.beforeEach()` | `<Route loader>`/包装组件 | 鉴权拦截，最常用 |
| **懒加载** | `() => import(...)` | `lazy(() => import(...))` | 路由级代码分割 |

两个对后端最有用的点，展开看：

**① 路由守卫 —— 前端的"拦截器 / 过滤器"**，未登录就踢回登录页：

```js
router.beforeEach((to, from) => {
  if (to.path !== '/login' && !localStorage.getItem('token')) {
    return '/login'        // 拦截并改道，等价后端的 Interceptor
  }
})
```

**② 懒加载 —— 呼应第一节的"代码分割"伏笔**。`() => import()` 写法让打包工具把每个路由单独拆成一个 `.js` 文件，首屏只下载当前页，访问到才加载对应分包：

```js
{ path: '/report', component: () => import('@/views/Report.vue') }
// 打包后：Report 单独成 report.a1b2.js，进首页时不加载，点进去才请求
```

### 小结与伏笔

- SPA 路由的本质：**全站一个 html，用 JS 模拟换页**——拦截导航、改地址栏、匹配渲染，三步而已。
- 两把钥匙：`location.hash`（hash 模式）与 `history.pushState`（history 模式）。
- History 模式刷新会 404，**必须后端配 fallback 到 index.html**。
- 路由库 = 这三步 + 参数 / 嵌套 / 守卫 / 懒加载。

**伏笔**：路由表里写的 `component: Home`，那个 `Home` 既不是 HTML 标签，也不是普通函数，却能被当作"页面"渲染出来——**组件到底是什么？为什么能像标签一样互相引用？** 正是下一节的内容。

## 组件到底是什么？为什么能像标签一样引用？(组件化)

```jsx
<Home />          // 浏览器：这是什么？我只认识 div、h1…
<HelloWorld name="LZY" />
```

如果直接把这段塞进 `.html`，浏览器会当成未知标签忽略掉。

### 1. 组件的本质：一个返回「虚拟 DOM」的函数

### 2. React 组件

```jsx
// 组件源码 Hello.jsx:
function Hello({ name }) {
  return <h1 className="title">Hello {name}</h1>
}
```

```js
// npm run build 编译后(React 17+):
import { jsxs as _jsxs } from "react/jsx-runtime"
function Hello({ name }) {
  return _jsxs("h1", { className: "title", children: ["Hello ", name] })
}
// React 17 以前(classic)
function Hello({ name }) {
  return React.createElement("h1", { className: "title" }, "Hello ", name)
}
```

```js
// 浏览器执行后:
const props = {name: 'LZY'}
const VDom = Hello(props)
console.log(VDom)
// { type: "h1", props: { className: "title" }, children: ["Hello ", "LZY"] }
```

### 3. 自定义组件：引用的本质是函数调用

```jsx
// 组件源码 App.jsx:  父组件里引用子组件 Hello
import Hello from './Hello'
function App() {
  return (
    <div className="app">
      <Hello name="LZY" />
      <Hello name="Tom" />
    </div>
  )
}
```

```js
// npm run build 编译后(React 17+):
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime"
import Hello from './Hello'
function App() {
  return _jsxs("div", { className: "app", children: [
    _jsx(Hello, { name: "LZY" }),        // ← 自定义组件：type 是 Hello 函数本身
    _jsx(Hello, { name: "Tom" })
  ] })
}
// React17以前(classic)
function App() {
  return React.createElement("div", { className: "app" },
    React.createElement(Hello, { name: "LZY" }),   // ← 第一个参数是 Hello 函数，不是字符串
    React.createElement(Hello, { name: "Tom" })
  )
}
```

于是「组件嵌套组件」本质就是「函数调用函数」，依赖关系一路串成第 1 节讲的依赖树。这就是它能像标签一样无限相互引用的原因。

### 4. Vue 组件也是同样的道理，顺便看一眼

```vue
<!-- 组件源码: Hello.vue -->
<template>
  <h1 class="title">Hello {{ name }}</h1>
</template>

<script setup>
defineProps({ name: String })
</script>
```

```js
// @vue/compiler-sfc 编译后
import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

export function render(_ctx) {
  return (_openBlock(), _createElementBlock(
    "h1",
    { class: "title" },
    "Hello " + _toDisplayString(_ctx.name),
    1 /* TEXT */
  ))
}
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'   // 内部驱动 @vue/compiler-sfc 编译 .vue

export default defineConfig({
  plugins: [vue()],
})
```

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'   // 内部驱动 babel/esbuild 做 JSX 转换

export default defineConfig({
  plugins: [react()],
})
```

> `.jsx` 交给 plugin-react，`.vue` 交给 plugin-vue，最终都转成执行返回值为虚拟 DOM 的函数

### 5. 为什么需要虚拟 DOM？

真实 DOM：浏览器一个页面里的真实节点。

虚拟 DOM：则是用一个普通 JS 对象，描述一个真实 DOM 节点长什么样。

```js
// React element 真实长相
const ReactElement = {
  $$typeof: Symbol(react.element),
  type: "h1",
  key: null,
  ref: null,
  props: {
    className: "title",
    children: ["Hello ", "LZY"]
  }
}

// Vue VNode 真实长相（你选中代码 render 执行后）
const VueVNode = {
  __v_isVNode: true,                 // Vue 的 VNode 标记
  type: "h1",
  props: { class: "title" },
  children: "Hello LZY",
  shapeFlag: 9,                      // ELEMENT + TEXT_CHILDREN，告诉运行时"我是元素、孩子是文本"
  patchFlag: 1,                      // /* TEXT */ 编译期算好的"只有文本会变"
  key: null,
  ref: null,
  el: null,                          // 挂载后指向真实 DOM 节点
  dynamicChildren: null
  // …还有 appContext 等
}
```

**真实节点的缺点**：一个最小的 `<div>` 真实节点，挂着几百个属性（`style`、`offsetTop`、事件…），内存占用大，且一旦修改就会立即引发页面变化。

虚拟 DOM 作为一个中间对象，先在内存里用极少的字段描述真实 DOM。

有了这个基础之后我们可以做到:

- **最小化真实 DOM 操作**：状态变化时，生成新虚拟 DOM，与旧的**比对（diff）**，只把**变化的那几处**打补丁到真实 DOM，避免全量重建。
- **声明式开发**：你只描述「UI 是什么」，框架负责「怎么变」，不用手写一行行 DOM 增删改。
- **批量更新**：多次状态变更可合并成一次 diff、一次提交，减少重排重绘次数。
- **跨平台**：虚拟 DOM 只是 JS 对象，换个渲染器就能渲染到别处（React Native 渲染成原生 App，SSR 渲染成 HTML 字符串），不绑定浏览器。
- **可优化、可预测**：UI 变成「数据 → 对象树」的纯函数映射，便于 diff 策略（`key`）、编译期优化（Vue 的 `patchFlag`）等做文章。

### 6. 编译与渲染分离

经过上面的步骤，我们终于得到了虚拟 DOM。接下来要做的，就是把它变成真实 DOM。

React 代码里常常能看到下面这两条 import：

```js
import React from 'react';
import ReactDOM from 'react-dom';
```

仔细观察会发现一条分工规律：组件、Hooks（`useState`、`useEffect`…）、`createElement` / JSX 这些「描述 UI」的能力，都从 `'react'` 引入；而 `render`、`createRoot`、`hydrate` 这些「把 UI 真正挂到页面上」的能力，则从 `'react-dom'` 引入。

一句话总结：

- `'react'` 是**声明层**，只负责定义「UI 长什么样」，产出与平台无关的虚拟 DOM；
- `'react-dom'` 是**渲染层**，负责把虚拟 DOM 落地到具体宿主环境（浏览器 DOM）。

换个渲染层就能换平台——比如 `react-native` 渲染成原生组件、`react-three-fiber` 渲染成 3D 场景。

这就是「编译（声明）与渲染分离」。

```txt
【开发机 / Node.js，打包期】
① 源码          Hello.jsx / Hello.vue        ← 你写的，浏览器不认识
      │  编译器（babel / esbuild / @vue/compiler-sfc，由 vite 插件驱动）
      ▼
② 编译产物      转译后的 JS（render 函数 / createElement 调用）  ← 浏览器能认的 JS
      │  打包器（Rollup，build 时；dev 时 vite 走 ESM 不打包）
      ▼
③ 打包产物      bundle / dist 产物（带 hash 的 .js + .css + index.html）
─────────────────────────  部署，浏览器下载  ─────────────────────────
【用户浏览器，运行期】
      │  JS 引擎执行（V8）：调用 render 函数
      ▼
④ 虚拟 DOM      VNode 对象树（内存里的 JS 对象，描述 UI）
      │  框架渲染器 / 协调器（React Reconciler、Vue renderer）：diff + 调 DOM API
      ▼
⑤ 真实 DOM      document 上的真实节点树（document.createElement 产物）
      │  浏览器渲染引擎：样式计算 → 布局(重排) → 绘制(重绘) → 合成
      ▼
⑥ 像素 / UI     用户最终看到的画面
```

## 为什么改一个变量，页面就自己变了？（响应式 / 数据驱动）

我们了解一个框架，要知道框架整个业务流程其实是要解决两件事

包括看源码，我们也是要按照两个脉络去看:

初始化 和 更新

上面的所有内容其实是解决了第一个问题，初始化，那么我们这节要解决下一个问题，更新:

### 1. 先看清这件"反直觉"的事

如果不用框架，纯手写原生 JS，想让页面上的数字变一下，你得亲自去操作 DOM：

```js
let count = 0
const btn = document.getElementById('btn')
btn.onclick = () => {
  count++
  btn.textContent = `点了 ${count} 次`   // 必须手动把新值写回 DOM
}
```

数据（`count`）和视图（按钮文本）是两套东西，你得**手动**把数据搬到视图上。漏写一行，页面就不动。

框架颠覆的就是这一点：

> 你只改一个 JS 变量（`count++` 或 `setCount`），不碰任何 DOM，页面上对应的那块就自己变了。

这就是「**响应式 / 数据驱动**」：UI 是数据的「投影」，数据一变，投影自动跟着变。你不再操心「怎么把新值塞进 DOM」，只操心「数据应该是多少」。

那么问题来了——**框架是怎么"知道"我改了数据、又是怎么把变化精确反映到页面上的？**

### 2. 响应式要解决的两件事

把上面的问题拆开，任何框架的「更新」流程，本质都要解决两件事：

1. **监听**：数据一变，框架要第一时间知道「变了」，还要知道「谁用了这个数据」。
2. **更新**：知道之后，重新生成新的虚拟 DOM，和旧的 diff，只把变化处打补丁到真实 DOM（这一步就是上一节讲的渲染）。

第 2 步 Vue 和 React 几乎一样（都是 diff + patch）。**真正分道扬镳的是第 1 步——"怎么知道数据变了"**：

- **Vue 走「自动追踪」**：劫持你的数据对象，你怎么改它都能拦截到。
- **React 走「手动通知」**：不劫持数据，要你自己调用 `setState` 告诉它「我变了」。

### 3. Vue：Proxy 劫持（自动追踪）

Vue 3 用 ES6 的 `Proxy` 把你的数据对象包了一层。读取（get）时偷偷记下「谁在用我」（依赖收集），赋值（set）时通知所有用到它的地方更新（触发更新）。

```js
// 极简版，示意 Vue 响应式的核心
const state = reactive({ count: 0 })   // 内部用 Proxy 包了一层

effect(() => {
  // 读 state.count → Proxy 的 get 触发 → 记下"这个 effect 依赖 count"
  console.log('视图渲染：', state.count)
})

state.count++   // 赋值 → Proxy 的 set 触发 → 通知上面的 effect 重新执行
```

> 关键点：你**直接改** `state.count++` 就行，Proxy 的 `set` 拦截器会自动被触发，用到它的组件自动重渲染。你感觉不到「通知」这一步，所以叫「自动追踪」。

### 4. React：setState 触发重渲染（手动通知）

React 反过来：它**不碰你的数据**，也就无从"自动知道"你改了什么。约定是——你必须通过 `setState`（函数组件里是 `useState` 返回的 setter）来告诉 React「状态变了，请重渲染」。

```jsx
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>   {/* ✅ 调 setter，React 才知道 */}
      点了 {count} 次
    </button>
  )
}
```

收到 `setCount` 后，React 会**重新执行整个 `Counter` 函数**，得到一棵新的虚拟 DOM，再去 diff、patch。

```jsx
// ❌ 反例：直接改变量，React 完全无感，页面不会动
let count = 0
function Counter() {
  return <button onClick={() => count++}>点了 {count} 次</button>
}
```

直接 `count++` 不会触发任何重渲染——因为没人通知 React，它根本不知道发生了什么。这也是为什么 React 里**绝不能直接改 state**，必须走 setter。

两条路线对比：

| | Vue | React |
|---|---|---|
| 怎么知道数据变了 | Proxy 劫持，自动拦截 | 你手动调 `setState` 通知 |
| 改数据的写法 | 直接改 `state.count++` | 调 setter `setCount(count+1)` |
| 更新粒度 | 精确到用到该数据的组件 | 默认重渲染整个组件（及子树） |
| 心智模型 | 「数据是响应式的」 | 「状态变了要通知我」 |

### 5. 变了之后：虚拟 DOM diff 与 key

不管是 Vue 的自动触发，还是 React 的手动通知，**接下来的动作是一样的**：拿到「新虚拟 DOM」，和「旧虚拟 DOM」逐层比对（diff），算出最小差异，只把变化的那几处 patch 到真实 DOM。

列表场景下，diff 算法需要一个线索来判断「新旧两棵树里，哪个节点是同一个」——这就是 `key` 的作用。

```jsx
// 列表头部插入一项
// 旧：[B, C]      新：[A, B, C]

// ❌ 不写 key（按位置比对）：
// 位置0: B→A 改文本, 位置1: C→B 改文本, 位置2: 新增 C  → 改了 3 处

// ✅ 写 key（按身份比对）：
// key=B、key=C 原地不动，只在头部新增 key=A  → 只动 1 处
{list.map(item => <li key={item.id}>{item.name}</li>)}
```

> 所以列表要写 `key`，而且必须用**稳定且唯一**的 id（别用数组下标 `index`——插入/删除时下标会整体错位，等于没写）。`key` 是给 diff 算法的「身份证」，让它能跨次渲染认出「你还是原来那个节点」，从而复用而不是重建。

### 小结：一次更新的完整链路

```txt
① 数据变化      Vue: 改 state.count   /   React: 调 setCount()
      │  Vue: Proxy set 拦截，自动触发   |   React: setter 标记组件待更新
      ▼
② 通知框架      "用到这个数据的组件需要更新了"
      │  重新执行 render / 组件函数
      ▼
③ 新虚拟 DOM    生成一棵新的 VNode 树
      │  和上一次的旧树逐层比对（diff，靠 key 认节点）
      ▼
④ 最小差异      算出"只有这几处不一样"
      │  patch：只调用必要的 DOM API
      ▼
⑤ 真实 DOM      页面上对应的那一小块更新，用户看到变化
```

一句话收束：**改一个变量页面就自己变，靠的是「框架感知数据变化 → 重新生成虚拟 DOM → diff → 只更新变化的那一点点」这条链路。** 你只管描述数据，剩下的交给框架。

## 单线程的 JS 怎么做到「同时」干很多事？（事件循环 / 异步）

- 冲突：第 1 节说「Node 单线调用」，那 setTimeout、fetch、await 凭什么不卡死
- 闭环：调用栈 + Web APIs + 宏/微任务队列；Promise/async-await 本质
- 这块对后端最反直觉，建议单独成节

## TypeScript 在运行时消失了，它到底约束了什么？

- 呼应第 2 节伏笔（tsconfig.json vs tsconfig.node.json）
- 类型仅编译期存在，对后端「强类型」认知是个冲突点
