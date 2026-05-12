# tRPC 请求完整调用链 —— 以 fetchAvatars 为例

> 以 MyAvatarList 列表拉取为例，从 React 组件发起请求，到后端数据库返回数据的完整链路。

---

## 总览

```
MyAvatarList/index.tsx
  └── usePaginatedAvatar()          ← hooks/index.ts 统一导出
        └── AiAvatarBlocks/hooks/fetch.ts
              └── api.avatar.fetchAvatars.useQuery()
                    └── web/src/utils/api.ts  (tRPC 客户端)
                          └── HTTP POST /api/trpc/avatar.fetchAvatars
                                └── web/src/pages/api/trpc/[trpc].page.ts  (Next.js API Route)
                                      └── createNextApiHandler(appRouter)
                                            └── server/router/index.ts  (appRouter)
                                                  └── avatar: avatarRouter
                                                        └── server/router/routes/avatar.ts
                                                              └── fetchAvatars service
                                                                    └── server/prisma/db.ts  (Prisma → PostgreSQL)
```

---

## 逐层说明

### 1. `MyAvatarList/index.tsx:35` — UI 组件，发起分页请求

```
MyAvatarList/index.tsx
函数：MyAvatarList()
定位：页面级展示组件，负责渲染 Avatar 瀑布流列表
```

调用 `usePaginatedAvatar({ avatarSource: 'personal' })`，拿到数据后渲染卡片列表。  
监听滚动到底（`useInViewport`），自动调用 `loadMore()` 翻页。

---

### 2. `AiAvatarBlocks/hooks/index.ts` — hooks 统一出口

```
AiAvatarBlocks/hooks/index.ts
定位：hooks 目录的桶文件（barrel export），统一对外暴露 fetch.ts 中的 hooks 和类型
```

只做 re-export，不含逻辑：

```ts
export { usePaginatedAvatar, useQueryAvatar, useDeletePersonalAvatar } from './fetch'
```

---

### 3. `AiAvatarBlocks/hooks/fetch.ts:70` — 分页状态管理 hook

```
fetch.ts
函数：usePaginatedAvatar(input)
定位：封装翻页逻辑的自定义 hook，维护 currentPage / allItems / hasMore 状态
```

核心：调用 `api.avatar.fetchAvatars.useQuery(params)`，在 `onSuccess` 回调里：

- 第 1 页 → 重置列表
- 第 N 页 → 追加到 allItems

`loadMore()` 递增 `currentPage`，触发 re-query。

---

### 4. `web/src/utils/api.ts:153` — tRPC 客户端实例

```
utils/api.ts
导出：api = createTRPCNext<AppRouter>({...})
定位：全局唯一 tRPC 客户端，所有前端接口调用的入口
```

关键配置：

| 配置项 | 说明 |
|--------|------|
| `getTRPCApiUrl()` | 浏览器返回 `/api/trpc`，SSR 返回 `http://localhost:{PORT}/api/trpc` |
| `httpBatchLink` | 默认将多个请求合并为一个 HTTP 请求 |
| `httpLink` | `skipBatch: true` 时单独发请求 |
| `throwMessageLink` | 自定义 link，统一处理错误上报 |
| `superjson` | 序列化/反序列化（支持 Date、Map 等类型） |

`api.avatar.fetchAvatars.useQuery()` 最终发出：  
`POST /api/trpc/avatar.fetchAvatars`

---

### 5. `web/src/pages/api/trpc/[trpc].page.ts` — Next.js API Route 入口

```
[trpc].page.ts
函数：createNextApiHandler({ router: appRouter, createContext: createTRPCContext })
定位：所有 /api/trpc/* 请求的统一接收端，将 Next.js 请求适配为 tRPC handler
```

- `[trpc]` 动态路由匹配任意路径
- `createContext` → 每次请求调用 `createTRPCContext()` 构建上下文
- 开发环境额外挂载 `middleware` 执行异步任务

---

### 6. `server/router/trpc.ts` — tRPC 上下文与中间件

```
router/trpc.ts
函数：createTRPCContext() / getTrpcContext()
定位：每个请求的上下文工厂，解析 session、host、IP、语言等信息注入 ctx
```

构建的 `ctx` 包含：

```ts
{
  prisma,      // 对应 hostKey 的 Prisma 实例
  session,     // NextAuth session（含 userId）
  hostKey,     // 多租户域名标识
  language,    // 请求语言
  ip, headers, cookies, platform, ...
}
```

同时定义各类 procedure（中间件链）：

| procedure | 中间件 |
|-----------|--------|
| `publicProcedure` | 日志 + 错误翻译 |
| `protectedProcedure` | 日志 + 错误翻译 + 登录校验 |
| `taskProcedure` | 登录校验 + 分布式锁（防并发扣点） |
| `adminProcedure` | 登录校验 + 管理员权限校验 |

---

### 7. `server/router/index.ts:142` — appRouter 主路由

```
router/index.ts
导出：appRouter = createTRPCRouter({ avatar: avatarRouter, ... })
定位：所有子路由的挂载中心，决定路由命名空间
```

`avatar: avatarRouter` 将 `avatar.*` 下的所有接口挂载到主路由。  
同时导出 `AppRouter` 类型，前端 `api.ts` 通过泛型获得完整类型推断。

---

### 8. `server/router/routes/avatar.ts:77` — avatar 子路由

```
router/routes/avatar.ts
路由：avatarRouter.fetchAvatars
定位：avatar 业务路由，定义接口的权限、入参校验、业务逻辑调用
```

```ts
fetchAvatars: publicProcedure        // 公开接口，无需登录
  .input(queryAvatarInputSchema)     // Zod 校验入参
  .query(async ({ ctx, input }) => {
    const { data, total } = await fetchAvatars({ ... })  // 调用 service 层
    // 翻译官方 avatar 名称
    return { items: data.map(convertAvatarToVo), total }
  })
```

---

### 9. `server/prisma/db.ts` — Prisma 数据库连接

```
server/prisma/db.ts
函数：getHostKeyPrisma(hostKey)
定位：多租户 Prisma 实例管理，按 hostKey 返回对应数据库连接（单例缓存）
```

通过环境变量 `DATABASE_URL_{HOST_KEY}` 区分不同租户数据库，实例缓存在 `globalThis.map` 中避免重复创建。

---

## 数据流向图

```
[浏览器 / SSR]
     │
     │  usePaginatedAvatar({ avatarSource: 'personal' })
     ▼
[fetch.ts]  api.avatar.fetchAvatars.useQuery(params)
     │
     │  HTTP POST /api/trpc/avatar.fetchAvatars  (superjson 序列化)
     ▼
[api.ts]  createTRPCNext → httpBatchLink → getTRPCApiUrl()
     │
     ▼
[Next.js API Route]  [trpc].page.ts → createNextApiHandler
     │
     │  createTRPCContext()  构建 ctx
     ▼
[trpc.ts]  publicProcedure 中间件链（日志 → 错误翻译）
     │
     ▼
[router/index.ts]  appRouter → avatar: avatarRouter
     │
     ▼
[routes/avatar.ts]  fetchAvatars.query → service/avatar.fetchAvatars()
     │
     ▼
[db.ts]  getHostKeyPrisma(hostKey) → PrismaClient → PostgreSQL
     │
     ▼  返回 { items, total }
[routes/avatar.ts]  convertAvatarToVo + batchTranslate
     │
     ▼  superjson 反序列化
[fetch.ts]  onSuccess → setAllItems → 触发 React 重渲染
     │
     ▼
[MyAvatarList/index.tsx]  渲染 AiAvatarShow 卡片列表
```

---

## 文件索引

| 层级 | 文件（简写路径） | 核心函数 |
|------|----------------|----------|
| UI 组件 | `MyAvatarList/index.tsx:35` | `usePaginatedAvatar()` |
| hooks 出口 | `AiAvatarBlocks/hooks/index.ts:9` | re-export |
| 分页 hook | `AiAvatarBlocks/hooks/fetch.ts:70` | `usePaginatedAvatar()` |
| tRPC 客户端 | `web/src/utils/api.ts:153` | `createTRPCNext` |
| API Route 入口 | `[trpc].page.ts:20` | `createNextApiHandler` |
| tRPC 上下文 | `server/router/trpc.ts:248` | `createTRPCContext` |
| 主路由 | `server/router/index.ts:142` | `appRouter` |
| avatar 子路由 | `server/router/routes/avatar.ts:77` | `fetchAvatars` |
| 数据库连接 | `server/prisma/db.ts:22` | `getHostKeyPrisma` |
