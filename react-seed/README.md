# React Seed

React 18 + TypeScript + Tailwind + Vite 的开箱即用的React工程基座。

AI友好型项目，前期基础必须打牢，AI会模仿项目的写法，差的只会更差。

## 快速开始

```bash
npm install
npm run dev
```

## Demo 业务流程

示例使用 Maker、Checker 两种角色演示任务流转。开发环境右侧的用户切换器可切换不同角色。

```text
Pending / Returned -- Maker 提交 --> Submitted -- Checker 批准 --> Approved
                                         |
                                         +-- Checker 退回 --> Returned

Pending / Returned -- Maker 取消 --> Cancelled
```

主流程 `Submitted -> Approved`：Maker 编辑任务名称和描述后提交，Checker 打开已提交任务并批准。

## 常用命令

| 命令                              | 说明                                  |
| --------------------------------- | ------------------------------------- |
| `npm run dev`                     | 启动开发服务器并通过反向代理连接 API   |
| `npm run dev:mock`                | 使用本地 Mock 启动开发服务器          |
| `npm run build`                   | 类型检查并构建开发环境产物            |
| `npm test`                        | 运行 Vitest                           |

## 分层与职责

| 层级                          | 作用                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/main.tsx`                         | 应用启动入口，完成主题、用户登录等首次渲染前的全局初始化 |
| `src/App.tsx`                          | 组合 Router、全局 Loading、Keep Alive 等应用级 Provider；Provider 的统一挂载入口                           |
| `src/router/routes.tsx`                | 路由配置的唯一来源，集中维护 `RoutePath`、页面组件、标题、角色和 Keep Alive；新增页面在此注册                 |
| `src/components/MainLayout/index.tsx`  | 默认页面外壳，放所有页面共用的初始化与结构，例如标题、公共工具和 `Outlet`；特殊页面外壳应额外封装 Layout       |
| `src/components/`                      | 放置跨页面复用的展示和交互组件，不承载页面流程                                                             |
| `src/components/ResizableTable/`       | 统一封装列宽、拖拽、显隐、顺序和持久化；页面只提供业务列与表格数据                                            |
| `src/api/request.ts`                   | Axios 实例和通用响应处理的唯一入口，统一处理业务错误、网络错误及响应体解包                                    |
| `src/store/useUserStore.ts`            | 统一负责登录、用户信息和权限 管理；页面禁止解析 token，禁止直接调用用户接口                                         |
| `src/store/useTaskPoolStore.ts`        | 跨页面触发任务表格刷新的协作信号示例；其他表格按相同模式建立各自 Store                                        |
| `src/store/useGlobalLoadingStore.ts`   | 统一管理支持并发计数的全局 Loading；业务侧通过 `startGlobalLoading()` 开始loading 并获取清理函数                            |
| `src/types/`                           | 放置跨层共享的模型与枚举；                                                       |
| `mock/`                                | 提供本地接口和可变示例数据，仅开发服务器使用，并复用正式接口类型                                               |

## DevUserSwitcher

`DevUserSwitcher` 使用条件动态导入。`__MOCK_ENABLED__` 由 Vite 在编译期替换，所有 `build:*` 命令下均为 `false`，Rollup 会删除该分支及动态导入模块，因此组件代码不会进入打包产物，而不是打包后再通过 Mock 标记隐藏。
可根据需要进行改造，将切换用户的逻辑改为切换token

## 环境配置

`.env.[mode]` 保存浏览器端需要的 `APP_*` 环境标识，并通过 `APP_OUT_PATH` 指定当前 mode 的构建子目录。开发服务器使用的 API 反向代理地址集中定义在 `vite.config.ts` 的 `API_PROXY_TARGETS` 中，不注入浏览器代码。构建产物输出到 `dist/<APP_OUT_PATH>/`。
