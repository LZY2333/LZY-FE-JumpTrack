# Pollo.ai 路由统一重构分析

> 去除 `/app` 层，回归独立路由，统一登录/未登录体验

---

## 一、当初为什么设计 `/app?target=` 模式

### 1.1 核心问题：Next.js Pages Router 的页面切换会销毁组件

在 Next.js Pages Router 中，从 `/image-to-video` 跳转到 `/text-to-video`，虽然浏览器不会硬刷新，但 Next.js 会：

1. **彻底卸载 (Unmount)** 旧页面的 React 根组件
2. **重新挂载 (Mount)** 新页面的根组件
3. **重新执行 `getServerSideProps`**，向服务器发起数据请求

这意味着：页面内的所有 React 状态、DOM 节点、WebSocket 连接、定时器全部被销毁重建。

### 1.2 设计目的

将所有工具统一收拢到 `/app?target=xxx` 这个单一 Next.js 路由下，仅改变 URL Query 参数，从而实现：

| 目的         | 具体实现                                                                                      |
|--------------|-----------------------------------------------------------------------------------------------|
| **极速切换** | 同一个 `app/index.page.tsx` 不卸载，仅根据 `target` 参数切换中间的表单组件                     |
| **状态保留** | 右侧 `InflowRightContent`（几百条生成记录、WebSocket 长连接、视频播放进度）永不销毁               |
| **跳过 SSR** | 使用 `history.pushState` 骗过 Next.js，不触发 `getServerSideProps`，纯客户端秒切                |
| **SEO 解耦** | SEO 页面（如 `/ai-image-generator`）轻量化，专注给搜索引擎看；`/app` 工作台不考虑 SEO，加载重型 JS |
| **代码集中** | 鉴权检查、全局弹窗、快捷键、公共 Provider 只在 `app/index.page.tsx` 写一次                       |

### 1.3 关键技术实现

通过一套 **Store ↔ URL 双向绑定** 机制，架空了 Next.js 原生路由：

```
用户点击左侧菜单
  → setInFlowTargetQueryParams({ target: 'text-to-image' })  // 改 Zustand Store
  → QuerySyncProvider 监听到 Store 变化
  → history.pushState({}, '', '/app?target=text-to-image')    // 偷改地址栏
  → MainContent 读取新 target → formConfig[target].render()  // 渲染对应表单
  → InflowRightContent 完全不受影响                            // 右侧不销毁
```

### 1.4 一开始就用独立路由为什么不好？

1. **状态丢失**：用户在 A 工具填了 prompt，切到 B 工具再切回来，prompt 消失
2. **右侧列表重建**：每次切换都要重新连接 WebSocket、重新分页查询几百条记录、重新挂载大量 DOM
3. **SSR 重复执行**：每个工具页面都有 `getServerSideProps`，切换一次就要重新向服务器请求数据
4. **代码分散**：鉴权、全局弹窗、公共 Provider 需要在每个页面重复引入

---

## 二、`/app` 模式产生的缺点

### 2.1 开发维护的核心痛苦：两套代码

每新增一个 AI 工具，前端需要做两套工作：

| 工作     | SEO 页面（未登录）                 | /app 工作台（已登录）                       |
|----------|----------------------------------|-------------------------------------------|
| 页面路由 | 新建 `xxx/index.page.tsx`        | 在 `formConfig.tsx` 注册                  |
| 菜单项   | 在 `useCompactMenuList.tsx` 添加 | 在 `useMenuList.tsx` 添加                 |
| SSR 数据 | 各自写 `getServerSideProps`      | 在 `serverRequestConfig.ts` 添加          |
| 布局适配 | 使用 `MenuLayout` + `Hero`       | 使用 `LeftMenuLayout` + `ToolWrapContent` |
| 点击行为 | `<Link href="/xxx">`             | `setInFlowTargetQueryParams()`            |

### 2.2 其他技术债务

| 问题                   | 说明                                                                           |
|------------------------|--------------------------------------------------------------------------------|
| **首屏加载沉重**       | `/app` 的 `getServerSideProps` 通过 `serverRequestConfig` 一次性拉取几十个接口 |
| **内存泄漏风险**       | 用户长时间不刷新，所有工具的残留状态积累在内存中                                |
| **Bundle Size**        | 虽然用了 `next/dynamic` 按需加载，但 formConfig 字典的注册本身就引入了间接依赖  |
| **`useIsInApps` 分叉** | 整个代码库中大量 `if (isInApps)` 分支，导致逻辑碎片化                           |
| **URL 语义弱**         | `/app?target=text-to-image` 不如 `/text-to-image` 直观，分享和书签体验差        |

---

## 三、改版目标明确

| 维度           | 目标                                                                      | 参照                           |
|----------------|---------------------------------------------------------------------------|--------------------------------|
| **路由**       | 统一使用独立路由（`/ai-image-generator`, `/image-to-video` 等），去除 `/app` | 原未登录路由                   |
| **侧边栏按钮** | 统一使用已登录的侧边栏样式和功能                                          | 原已登录 `LeftMenuLayout`      |
| **左侧表单**   | 统一使用已登录的表单组件                                                  | 原已登录 formConfig 渲染的组件 |
| **右侧列表**   | 未登录：社区资源；已登录：用户 assets（与原 /app 完全一致）                    | 原已登录 `InflowRightContent`  |
| **切换不刷新** | 切换路由时已登录用户的 assets 列表不重建                                  | 原 /app 的行为                 |
| **SEO 内容**   | 已登录时完全移除（Hero/FAQ/评价等），只保留工作台                            | -                              |
| **Chat 模式**  | 统一可用（未登录用户点击触发登录弹窗）                                      | -                              |

---

## 四、未登录 vs 已登录侧边栏菜单对比

### 4.1 菜单项完全一一对应

两套侧边栏包含 **15 个菜单项**，**完全对应，无遗漏**：

| #  | 名称                   | 已登录 type              | 未登录 route              |
|----|------------------------|--------------------------|---------------------------|
| 1  | Text to Image          | `text-to-image`          | `/ai-image-generator`     |
| 2  | Image to Image         | `image-to-image`         | `/image-to-image-ai`      |
| 3  | AI Image Effects       | `photo-effects`          | `/photo-effects`          |
| 4  | AI Image Tools         | `image-tools`            | `/image-tools`            |
| 5  | Image to Video         | `image-to-video`         | `/image-to-video`         |
| 6  | Text to Video          | `text-to-video`          | `/text-to-video`          |
| 7  | Reference to Video     | `reference-to-video`     | `/reference-to-video`     |
| 8  | Photo to Video Avatar  | `ai-avatar`              | `/ai-avatar`              |
| 9  | Apps                   | `use-cases`              | `/use-cases`              |
| 10 | Mimic Motion           | `mimic-motion`           | `/mimic-motion`           |
| 11 | AI Video Editor        | `ai-video-editor`        | `/ai-video-editor`        |
| 12 | Video to Video         | `video-to-video`         | `/video-to-video`         |
| 13 | AI Animation Generator | `ai-animation-generator` | `/ai-animation-generator` |
| 14 | AI Video Effects       | `video-effects`          | `/video-effects`          |
| 15 | AI Video Tools         | `tool`                   | `/tool`                   |

### 4.2 核心差异

| 维度      | 已登录 `LeftMenuLayout`                 | 未登录 `LeftCompactMenu`               |
|-----------|-----------------------------------------|----------------------------------------|
| 点击行为  | `setInFlowTargetQueryParams()` 改 Store | `<Link href={route}>` 路由跳转         |
| 激活判断  | 简单比较 `type === targetQuery`         | 复杂 120 行逻辑，处理 5+ 种特殊路由映射 |
| Chat 模式 | 支持 `supportChatMode` 字段             | 不支持                                 |
| 防抖/埋点 | `handleTabClick` 有防抖 + 详细埋点      | 直接 `setActiveTab` 无防抖             |
| 本地工具  | 不支持                                  | 支持 `useLocalTools`                   |
| 数据结构  | `type: MenuType`                        | `route: string` + `mapRoute?: string`  |

### 4.3 统一方案

保留 **已登录的样式和功能**，但将点击行为改为 **Link 跳转**：

- 数据结构：同时保留 `type`（用于 formConfig 查找）和 `route`（用于 Link 跳转）
- 激活判断：使用 pathname 匹配（可建立 `route → type` 映射表）
- Chat 模式：统一启用
- 防抖/埋点：保留已登录的完善实现

---

## 五、需要考虑的方面

### 5.1 代码搬运清单

#### 需要废弃的文件/模块

| 文件/目录                                                        | 原用途                   | 处理方式                   |
|------------------------------------------------------------------|--------------------------|----------------------------|
| `app/index.page.tsx`                                             | /app 工作台主页面        | **废弃整个路由**           |
| `app/_home/LeftMenuLayout/`                                      | 已登录侧边栏             | **合并到 LeftCompactMenu** |
| `app/_utils/getSsrData.ts`                                       | /app SSR 数据聚合        | **废弃**                   |
| `app/_utils/serverRequest.ts`                                    | /app SSR 批量请求        | **废弃**                   |
| `app/_constants/serverRequestConfig.ts`                          | /app SSR 接口配置        | **废弃**                   |
| `_context/InflowQuery/QuerySyncProvider.tsx`                     | Store ↔ URL 双向绑定     | **废弃**                   |
| `_context/InflowQuery/store.ts`                                  | InflowRouteQueryStore    | **废弃**                   |
| `_context/InflowQuery/hooks/useInflowRouteQueryStoreSelector.ts` | Store 选择器             | **废弃**                   |
| `_helpers/handleInflowUrl.ts`                                    | 构造 /app?target= URL    | **废弃**                   |
| `app/_store/formHistoryTab.ts`                                   | 移动端表单/历史 Tab 切换 | **迁移到公共目录**         |

#### 需要迁移的功能（从 app/ 搬到公共层）

| 功能                  | 原位置                              | 迁移目标                          |
|-----------------------|-------------------------------------|-----------------------------------|
| `formConfig.tsx` 字典 | `app/_constants/formConfig.tsx`     | `_constants/formConfig.tsx`（公共） |
| `GlobalModal` 组件    | `app/_components/GlobalModal/`      | 提升到 Layout 层                  |
| `FormHistoryTab` 组件 | `app/_components/FormHistoryTab/`   | 提升到 Layout 层                  |
| `useChatMode` hook    | `app/_hooks/useChatMode.ts`         | `_hooks/useChatMode.ts`（公共）     |
| `getActiveMenu` 逻辑  | `app/_home/helper/getActiveMenu.ts` | 合并到统一菜单模块                |

#### 需要全局搜索替换的引用

| 搜索项                              | 预估影响范围 | 替换方案                                  |
|-------------------------------------|--------------|-------------------------------------------|
| `useInflowRouteQueryStoreSelector`  | 10+ 文件     | 改为 `useRouter().query` 或 pathname 判断 |
| `setInFlowTargetQueryParams`        | 15+ 文件     | 改为 `router.push()` 或 `<Link>`          |
| `useIsInApps`                       | 20+ 文件     | 改为 `useSession()` 判断登录状态          |
| `handleInflowUrl` / `inflowBaseUrl` | 10+ 文件     | 直接使用独立路由路径                      |
| `/app?target=` 硬编码 URL           | 散落各处     | 替换为对应的独立路由 URL                  |

---

### 5.2 状态提升分析

#### 必须提升的 Context/Provider

| Provider                     | 当前位置                                     | 提升目标                            | 原因                                         |
|------------------------------|----------------------------------------------|-------------------------------------|----------------------------------------------|
| `FormStoreProvider`          | `app/index.page.tsx` 内部                    | **MenuLayout 层** 或 **各页面内部** | 管理表单全局状态（模型列表、风格库、lipSync 等） |
| `Text2ImageGeneratorContext` | `app/index.page.tsx` + `ai-image-generator/` | **各页面按需注入**                  | 文生图专属，不需要全局常驻                    |

#### 已在全局层、无需提升的

| Provider                   | 当前位置        | 说明                                              |
|----------------------------|-----------------|---------------------------------------------------|
| `InflowRouteQueryProvider` | `RootLayout`    | 废弃 QuerySyncProvider，但 Provider 壳可保留或移除 |
| `MediaToolsProvider`       | `RootLayout`    | 媒体工具弹窗已全局                                |
| `SiteTopBannersProvider`   | `DefaultLayout` | 顶部横幅已全局                                    |
| `AntdContextProvider`      | `AntdLayout`    | Ant Design 配置已全局                             |

#### Zustand Store 影响

| Store                          | 位置                                   | 是否需要改动                                 |
|--------------------------------|----------------------------------------|----------------------------------------------|
| `creationRecords` (全局 Store) | `_store/storeSlice/creationRecords.ts` | **不需要** - 已是全局 Zustand，跨页面天然持久 |
| `formHistoryTab`               | `app/_store/formHistoryTab.ts`         | **需要迁移** - 从 app/ 移到公共 _store/      |
| `InflowRouteQueryStore`        | `_context/InflowQuery/store.ts`        | **废弃**                                     |

---

### 5.3 SSR 数据策略

当前 `/app` 通过 `serverRequestConfig` 一次性拉取几十个接口的数据。废弃后：

**方案：各页面按需拉取 + 通用数据共享**

```
各独立路由页面的 getServerSideProps:
  ├── 通用数据（登录状态、用户信息、订阅状态）→ 从现有共享逻辑复用
  ├── 工具专属数据（模型列表、风格库等）→ 各页面自己拉取
  └── SEO 数据（CMS推荐、FAQ等）→ 仅未登录时拉取
```

涉及文件：

- 各独立路由页面的 `getServerSideProps` 需要补充已登录时的数据拉取逻辑
- 可从 `serverRequestConfig.ts` 中拆分出各工具需要的子集

---

### 5.4 右侧内容的条件渲染

| 用户状态 | 右侧内容                        | 实现方式                                    |
|----------|---------------------------------|---------------------------------------------|
| 未登录   | 社区资源（CMS 推荐、热门作品等）   | 各页面现有的 `HideLoggedInContent` 区域内容 |
| 已登录   | 用户 assets（InflowRightContent） | 从 Layout 层注入，与原 /app 完全一致         |

关键决策：InflowRightContent 的挂载层级（详见第六节）。

---

## 六、InflowRightContent 挂载层级方案对比

### 方案 A：放在 DefaultLayout 层

```
DefaultLayout
├── Header
├── main
│   ├── LeftCompactMenu (侧边栏)
│   ├── children (各页面的路由内容)
│   └── InflowRightContent (条件渲染)  ← 放在这里
└── Footer
```

| 维度           | 评估                                                                                   |
|----------------|----------------------------------------------------------------------------------------|
| **不刷新保证** | 完美 - DefaultLayout 在 pollo.ai 所有页面都不卸载                                      |
| **条件控制**   | 需要按 pathname 判断显隐（/pricing、/profile 等页面不展示）                               |
| **改动量**     | 中等 - 修改 DefaultLayout，增加右侧容器                                                 |
| **风险**       | DefaultLayout 变得臃肿；非工具页面仍会挂载 InflowRightContent 的 Provider（即使 UI 隐藏） |
| **响应式**     | 移动端需要额外处理（折叠/全屏切换）                                                      |

**代码示意**：

```tsx
// _layout/index.tsx (DefaultLayout)
const TOOL_ROUTES = ['/ai-image-generator', '/image-to-video', /* ... */]
const isToolPage = TOOL_ROUTES.some(r => pathname.startsWith(r))
const isLoggedIn = !!session

return (
  <div>
    <Header />
    <main className="flex">
      <LeftCompactMenu />
      <div className="flex-1">{children}</div>
      {isToolPage && isLoggedIn && <InflowRightContent />}
    </main>
    <Footer />
  </div>
)
```

---

### 方案 B：放在新的 ToolPageLayout 层（推荐）

在 DefaultLayout 和各工具页面之间，新增一个 `ToolPageLayout`，仅工具页面使用：

```
DefaultLayout
├── Header
├── main
│   └── ToolPageLayout (仅工具页面使用)
│       ├── LeftCompactMenu (统一侧边栏)
│       ├── children (各工具页面的表单内容)
│       └── InflowRightContent (已登录) / CommunityContent (未登录)
└── Footer
```

| 维度           | 评估                                                                   |
|----------------|------------------------------------------------------------------------|
| **不刷新保证** | 完美 - 只要工具页面共享此 Layout，组件不卸载                            |
| **条件控制**   | 天然精确 - 只有使用 ToolPageLayout 的页面才有右侧内容                  |
| **改动量**     | 较大 - 需要新建 Layout，所有 15 个工具页面的 `withLayouts` 需要添加此层 |
| **风险**       | 低 - 职责清晰，不污染其他页面                                           |
| **响应式**     | 可以在 ToolPageLayout 内统一处理移动端适配                             |

**实现方式**：利用 Next.js Pages Router 的嵌套 Layout 模式（通过 `withLayouts`）：

```tsx
// _layout/layouts/ToolPageLayout/index.tsx
export const ToolPageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const isLoggedIn = !!useSession()

  return (
    <div className="flex">
      <UnifiedLeftMenu /> {/* 统一侧边栏 */}
      <div className="flex-1">{children}</div>
      {isLoggedIn
        ? <InflowRightContent />    {/* 已登录：用户 assets */}
        : <CommunityContent />      {/* 未登录：社区资源 */}
      }
    </div>
  )
}

// 各工具页面使用：
// ai-image-generator/index.page.tsx
export default withLayouts(Page, [
  DefaultLayout,
  RootLayout,
  SiteSpecificContextLayout,
  AntdLayout,
  ToolPageLayout,  // ← 新增
])
```

**关键优势**：ToolPageLayout 在工具页面间切换时 **不会卸载**（因为它是所有工具页面共享的 Layout 层，Next.js 只替换 `children` 部分），InflowRightContent 自然不会被销毁。

> **注意**：这依赖于 Next.js Pages Router 中 `withLayouts` 的实现方式。需要确认当前项目的 `withLayouts` 是否支持跨页面保持 Layout 实例。如果 `withLayouts` 只是简单的组件嵌套（`<Layout><Page /></Layout>`），那么页面切换时 Layout 仍然会随 Page 一起被销毁重建。**需要验证 `withLayouts` 是否采用了持久化 Layout 模式**（即在 `_app.tsx` 中通过 `Component.getLayout?.() || defaultLayout` 模式实现）。

---

### 方案 C：不提升组件，使用 Zustand 持久化数据

不改变 InflowRightContent 的位置（仍在各页面内部），但通过全局 Zustand Store 持久化 assets 数据：

```
各工具页面:
├── 表单区域
└── InflowRightContent (每次路由切换都重建，但从 Zustand 恢复数据)
```

| 维度           | 评估                                                             |
|----------------|------------------------------------------------------------------|
| **不刷新保证** | 部分 - 数据不丢失，但 UI 会闪烁（unmount → mount），WebSocket 需重连 |
| **条件控制**   | 完美 - 各页面自主控制                                            |
| **改动量**     | 小 - 主要改 `useCreationRecordsV2` 的初始化逻辑                  |
| **风险**       | 中 - WebSocket 频繁断连重连；视频播放状态丢失；滚动位置丢失        |
| **适用场景**   | 如果"不刷新"只要求数据不丢（允许 UI 闪烁），此方案最简单            |

**改动点**：

- `creationRecords` store 已是 Zustand 全局，数据天然持久
- 需要修改 `useCreationRecordsV2` 的初始化逻辑：mount 时先检查 store 是否有数据，有则直接使用
- WebSocket 重连逻辑需要优化，避免每次 mount 都触发完整的重连流程

---

### 方案对比总结

| 维度           | A: DefaultLayout | B: ToolPageLayout | C: Zustand 持久化 |
|----------------|------------------|-------------------|-------------------|
| assets 不闪烁  | ✅ 完美           | ✅ 完美            | ❌ 有闪烁          |
| WebSocket 不断 | ✅                | ✅                 | ❌ 需重连          |
| 滚动位置保留   | ✅                | ✅                 | ❌ 丢失            |
| 视频播放保留   | ✅                | ✅                 | ❌ 丢失            |
| 职责清晰度     | ⚠️ 中            | ✅ 高              | ✅ 高              |
| 改动量         | 中               | 较大              | 小                |
| 代码污染风险   | ⚠️ 高            | ✅ 低              | ✅ 低              |

**推荐：方案 B**（ToolPageLayout），职责最清晰、体验最好。如果 `withLayouts` 不支持持久化 Layout 实例，则需要先改造 `_app.tsx` 的 Layout 机制，或退而选择方案 A。

---

## 七、需要改动的具体 hooks / context / store 清单

### 7.1 废弃项

| 模块                               | 文件                                                             | 影响                                   |
|------------------------------------|------------------------------------------------------------------|----------------------------------------|
| `QuerySyncProvider`                | `_context/InflowQuery/QuerySyncProvider.tsx`                     | 直接删除，所有引用处移除                |
| `InflowRouteQueryStore`            | `_context/InflowQuery/store.ts`                                  | 删除 Store 定义                        |
| `useInflowRouteQueryStoreSelector` | `_context/InflowQuery/hooks/useInflowRouteQueryStoreSelector.ts` | 全局搜索替换，改为 pathname 判断        |
| `setInFlowTargetQueryParams`       | `_context/InflowQuery/store.ts` 的 action                        | 所有调用处改为 `router.push()`         |
| `handleInflowUrl`                  | `_helpers/handleInflowUrl.ts`                                    | 所有引用改为直接使用独立路由 URL       |
| `useIsInApps`                      | `hooks/useIsInApps.ts`                                           | 20+ 引用处改为 `useSession()` 登录判断 |
| `getSsrData`                       | `app/_utils/getSsrData.ts`                                       | 随 /app 页面一起废弃                   |
| `serverRequest`                    | `app/_utils/serverRequest.ts`                                    | 随 /app 页面一起废弃                   |
| `serverRequestConfig`              | `app/_constants/serverRequestConfig.ts`                          | 拆分有价值的子集到各工具页面           |

### 7.2 需要迁移/改造项

| 模块                          | 原位置                                     | 改造内容                                                                         |
|-------------------------------|--------------------------------------------|----------------------------------------------------------------------------------|
| **formConfig**                | `app/_constants/formConfig.tsx`            | 保留字典结构，新增 `pathname → MenuType` 映射表，由 pathname 驱动而非 target query |
| **LeftMenuLayout → 统一菜单** | `app/_home/LeftMenuLayout/`                | 将已登录菜单的样式、防抖、Chat 模式支持合并到 `LeftCompactMenu`，点击行为改为 Link  |
| **useMenuList**               | `app/_home/LeftMenuLayout/useMenuList.tsx` | 合并到 `useCompactMenuList.tsx`，数据结构同时包含 `type` 和 `route`               |
| **getActiveMenu**             | `app/_home/helper/getActiveMenu.ts`        | 合并到统一菜单的激活判断逻辑（基于 pathname）                                      |
| **FormStoreProvider**         | `_context/Form/FormStoreProvider.tsx`      | 提升到 ToolPageLayout 层（如选方案 B），或各页面自行注入                            |
| **formHistoryTab store**      | `app/_store/formHistoryTab.ts`             | 迁移到 `_store/` 公共目录                                                        |
| **GlobalModal**               | `app/_components/GlobalModal/`             | 提升到 ToolPageLayout 或 DefaultLayout 层                                        |
| **FormHistoryTab**            | `app/_components/FormHistoryTab/`          | 提升到 ToolPageLayout 层                                                         |
| **useChatMode**               | `app/_hooks/useChatMode.ts`                | 迁移到 `_hooks/` 公共目录，去除 `useInflowRouteQueryStoreSelector` 依赖           |
| **InflowRightContent**        | `_components/InflowRightContent/`          | 提升到 ToolPageLayout 层，增加未登录/已登录条件渲染                               |

### 7.3 各独立路由页面改造

每个工具页面（15 个）需要：

1. **移除/条件化 SEO 内容**：已登录时不渲染 Hero、FAQ、评价等模块
2. **引入统一 Layout**：在 `withLayouts` 中添加 `ToolPageLayout`
3. **补充 SSR 数据**：`getServerSideProps` 需要在已登录时拉取工具专属配置数据
4. **移除 HideLoggedInContent 逻辑**：不再需要根据登录状态隐藏整个内容区

涉及的 15 个页面文件：

```
web/src/pages/pollo.ai/ai-image-generator/index.page.tsx
web/src/pages/pollo.ai/image-to-image-ai/index.page.tsx
web/src/pages/pollo.ai/photo-effects/index.page.tsx
web/src/pages/pollo.ai/image-tools/index.page.tsx
web/src/pages/pollo.ai/image-to-video/index.page.tsx
web/src/pages/pollo.ai/text-to-video/index.page.tsx
web/src/pages/pollo.ai/consistent-character-video/index.page.tsx  (reference-to-video)
web/src/pages/pollo.ai/ai-avatar/index.page.tsx
web/src/pages/pollo.ai/use-cases/index.page.tsx
web/src/pages/pollo.ai/mimic-motion/index.page.tsx
web/src/pages/pollo.ai/ai-video-editor/index.page.tsx
web/src/pages/pollo.ai/video-to-video/index.page.tsx
web/src/pages/pollo.ai/ai-animation-generator/index.page.tsx
web/src/pages/pollo.ai/template/index.page.tsx                    (video-effects)
web/src/pages/pollo.ai/tool/index.page.tsx
```

### 7.4 跨模块影响

| 影响点             | 详情                                                      |
|--------------------|-----------------------------------------------------------|
| **重定向规则**     | `web/config/redirects/` 中 `/app` 相关的重定向需要清理    |
| **重写规则**       | `web/config/rewrites/` 中 `/app` 相关的重写需要清理       |
| **埋点系统**       | 原有的 `/app` 页面埋点事件需要调整为各独立路由的埋点      |
| **A/B 测试**       | `useChatModeABTest` 等依赖路由判断的 A/B 测试需要适配     |
| **深度链接/分享**  | 所有生成 `/app?target=xxx` URL 的地方需要改为独立路由 URL |
| **useGenerateUrl** | `_hooks/useGenerateUrl/` 需要移除 inflow URL 生成逻辑     |

---

## 八、推荐实施路径

### Phase 1：基础设施（预计最大工作量）

1. **验证 `withLayouts` 的持久化能力**
   - 确认 `_app.tsx` 中 Layout 是否跨页面保持实例
   - 如果不支持，先改造 `_app.tsx` 的 `getLayout` 机制

2. **创建 ToolPageLayout**
   - 包含：统一侧边栏 + 右侧内容容器
   - 条件渲染：已登录 → InflowRightContent；未登录 → 社区资源

3. **统一侧边栏组件**
   - 合并 `LeftMenuLayout` 和 `LeftCompactMenu` 为一个组件
   - 点击行为统一为 Link 跳转
   - 保留已登录的样式、防抖、Chat 模式支持

4. **迁移公共模块**
   - formConfig、GlobalModal、FormHistoryTab、useChatMode 等

### Phase 2：逐页迁移（可并行）

对 15 个工具页面逐一改造：

1. 添加 `ToolPageLayout` 到 `withLayouts`
2. 已登录时条件移除 SEO 内容
3. 补充 `getServerSideProps` 的已登录数据拉取
4. 测试表单功能、Chat 模式、右侧 assets 展示

### Phase 3：清理（收尾）

1. 删除 `/app` 路由及所有关联文件
2. 全局搜索替换 `useIsInApps`、`handleInflowUrl`、`setInFlowTargetQueryParams` 等
3. 清理重定向/重写规则
4. 更新埋点和 A/B 测试配置

---

## 九、风险与注意事项

| 风险                                          | 等级   | 缓解措施                                                |
|-----------------------------------------------|--------|---------------------------------------------------------|
| `withLayouts` 不支持持久化 Layout             | **高** | 先验证再动工；不支持则改造 `_app.tsx` 或退选方案 A       |
| 15 个页面改造量大                             | **高** | 建立模板，逐页迁移，每页独立 PR                           |
| SEO 排名影响                                  | **中** | 路由 URL 不变，SEO 内容仍对未登录用户展示，影响可控       |
| 已登录首屏加载变慢                            | **中** | 各页面 GSSP 按需拉取，不再一次性加载所有数据             |
| formConfig 在 Layout 层使用时的数据流问题     | **中** | 表单仍在页面内渲染（非 Layout），formConfig 仅作查找工具用 |
| WebSocket / assets 列表在 Layout 层的内存占用 | **低** | 与原 /app 行为一致，无额外风险                           |
| Chat 模式对未登录用户的体验                   | **低** | 点击触发登录弹窗，已有成熟方案                           |

---

## 十、关键文件路径索引

```
# 需要废弃的核心文件
web/src/pages/pollo.ai/app/index.page.tsx:1
web/src/pages/pollo.ai/app/_home/LeftMenuLayout/index.tsx:1
web/src/pages/pollo.ai/app/_home/LeftMenuLayout/useMenuList.tsx:1
web/src/pages/pollo.ai/app/_constants/formConfig.tsx:1
web/src/pages/pollo.ai/app/_constants/serverRequestConfig.ts:1
web/src/pages/pollo.ai/app/_utils/getSsrData.ts:1
web/src/pages/pollo.ai/app/_utils/serverRequest.ts:1
web/src/pages/pollo.ai/_context/InflowQuery/QuerySyncProvider.tsx:1
web/src/pages/pollo.ai/_context/InflowQuery/store.ts:1
web/src/pages/pollo.ai/_context/InflowQuery/hooks/useInflowRouteQueryStoreSelector.ts:1
web/src/pages/pollo.ai/_helpers/handleInflowUrl.ts:1

# 需要改造的核心文件
web/src/pages/pollo.ai/_components/MenuLayout/LeftCompactMenu/index.tsx:1
web/src/pages/pollo.ai/_components/MenuLayout/LeftCompactMenu/hooks/useCompactMenuList.tsx:1
web/src/pages/pollo.ai/_components/InflowRightContent/index.tsx:1
web/src/pages/pollo.ai/_context/Form/FormStoreProvider.tsx:1
web/src/pages/pollo.ai/_layout/index.tsx:1
web/src/pages/pollo.ai/_layout/layouts/RootLayout/index.tsx:1
web/src/hooks/useIsInApps.ts:1
web/src/pages/pollo.ai/_hooks/useGenerateUrl/index.ts:1
web/src/pages/pollo.ai/app/_hooks/useChatMode.ts:1
web/src/pages/pollo.ai/app/_store/formHistoryTab.ts:1
web/src/pages/pollo.ai/app/_components/GlobalModal/index.tsx:1
web/src/pages/pollo.ai/app/_components/FormHistoryTab/index.tsx:1

# 需要逐一改造的 15 个工具页面
web/src/pages/pollo.ai/ai-image-generator/index.page.tsx:1
web/src/pages/pollo.ai/image-to-image-ai/index.page.tsx:1
web/src/pages/pollo.ai/photo-effects/index.page.tsx:1
web/src/pages/pollo.ai/image-tools/index.page.tsx:1
web/src/pages/pollo.ai/image-to-video/index.page.tsx:1
web/src/pages/pollo.ai/text-to-video/index.page.tsx:1
web/src/pages/pollo.ai/consistent-character-video/index.page.tsx:1
web/src/pages/pollo.ai/ai-avatar/index.page.tsx:1
web/src/pages/pollo.ai/use-cases/index.page.tsx:1
web/src/pages/pollo.ai/mimic-motion/index.page.tsx:1
web/src/pages/pollo.ai/ai-video-editor/index.page.tsx:1
web/src/pages/pollo.ai/video-to-video/index.page.tsx:1
web/src/pages/pollo.ai/ai-animation-generator/index.page.tsx:1
web/src/pages/pollo.ai/template/index.page.tsx:1
web/src/pages/pollo.ai/tool/index.page.tsx:1

# 全局入口和 Layout 文件
web/src/pages/_app.page.tsx:1
web/src/pages/pollo.ai/_layout/index.tsx:1
web/src/pages/pollo.ai/_layout/layouts/RootLayout/index.tsx:1
web/src/pages/pollo.ai/_layout/layouts/AntdLayout/index.tsx:1
web/src/layouts/SiteSpecificContextLayout/index.tsx:1

# Store 文件
web/src/pages/pollo.ai/_store/index.ts:1
web/src/pages/pollo.ai/_store/storeSlice/creationRecords.ts:1
web/src/pages/pollo.ai/_context/Form/store.ts:1
web/src/pages/pollo.ai/ai-image-generator/_store/Context.ts:1
```
