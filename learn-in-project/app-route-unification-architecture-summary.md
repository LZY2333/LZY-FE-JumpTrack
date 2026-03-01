# Pollo.ai 路由统一改造深度总结（基于现网架构与代码）

> 产出目标：回答“为什么有 `/app?target=` 双路由、为何当初这样设计、现在为何痛、回归独立路由后怎么保证右侧 assets 不刷新，以及精确到 hooks/context/store 的改造清单与可选方案”。

---

## 0. 资料来源与校验范围

本结论基于三类输入交叉校验：

1. 你指定的文档：

- `learn-in-project/App Architecture Deep Dive.md`
- `learn-in-project/___zee_text2image_two_way.md`

1. 当前项目关键代码（`ai-video-collection`）：

- `web/src/pages/pollo.ai/app/index.page.tsx`
- `web/src/pages/pollo.ai/app/_home/LeftMenuLayout/*`
- `web/src/pages/pollo.ai/_components/MenuLayout/LeftCompactMenu/*`
- `web/src/pages/pollo.ai/_context/InflowQuery/*`
- `web/src/pages/pollo.ai/_components/InflowRightContent/index.tsx`
- `web/src/pages/pollo.ai/app/_constants/formConfig.tsx`
- `web/src/pages/pollo.ai/app/_constants/serverRequestConfig.ts`
- `web/src/pages/_app.page.tsx`
- `packages/hosts/src/sites/pollo.ai.ts`

1. 线上信息（Web 检索）

- `pollo.ai` 公开路由/索引侧证明其独立 SEO 路由长期存在（如 `text-to-video` / `image-to-video` / `video-effects`）。

---

## 1. 当前项目的“两套路由”到底是什么

## 1.1 工作台路由（Inflow）

- 主入口是 `pathname = /app`（含一组 `/app/*` 重写别名）。
- 工具切换主要靠 query（`target`、`code`、`category`...）和 store 驱动，不是传统页面跳转。
- 典型链路：
  - 左侧点击：`setInFlowTargetQueryParams(...)`
  - `QuerySyncProvider` 监听 store，`history.pushState` 同步 URL
  - `MainContent` 用 `formConfig[target].render(...)` 渲染左侧表单
- 关键代码：
  - `web/src/pages/pollo.ai/app/_home/LeftMenuLayout/index.tsx`
  - `web/src/pages/pollo.ai/_context/InflowQuery/QuerySyncProvider.tsx`
  - `web/src/pages/pollo.ai/app/_constants/formConfig.tsx`

## 1.2 独立 SEO 路由（未登录主入口）

- 各能力有独立路径：`/ai-image-generator`、`/image-to-video`、`/text-to-video`、`/video-effects`、`/tool` 等。
- 左侧 compact 菜单是 `<Link href="/xxx">` 直接跳页面。
- 关键代码：
  - `web/src/pages/pollo.ai/_components/MenuLayout/LeftCompactMenu/hooks/useCompactMenuList.tsx`
  - `web/src/pages/pollo.ai/_components/MenuLayout/LeftCompactMenu/index.tsx`

## 1.3 为什么看起来“登录后大量变成 /app 开头”

- 不只是 query 模式，还叠加了 rewrites/alias：`/app/tool` -> `/tool`、`/app/video-effects` -> `/template`、`/reference-to-video` -> `/consistent-character-video` 等。
- 关键代码：`packages/hosts/src/sites/pollo.ai.ts`。

---

## 2. 当初为什么设计 `/app?target=`，一开始就独立路由为什么不好

## 2.1 设计目的（从代码角度可证）

1. 切换体验极快

- 单一页面壳下只切 `target`，不是完整页面切换。
- `MainContent` 只换中间表单，外壳不动。

1. 右侧重组件常驻

- `InflowRightContent` 与 `MainContent` 同级挂在 `app/index.page.tsx` 内，切工具不会销毁。
- 对重列表、任务流、滚动定位、Chat 相关交互更友好。

1. 统一工作台能力注入

- `FormStoreProvider`、`Text2ImageGeneratorContext`、`GlobalModal`、`FormHistoryTab`、`LeftMenuLayout` 一次注入。

1. SSR 聚合减少切换时重复初始化

- `/app` 首屏通过 `serverRequestConfig` 聚合拉取工作台所需数据，后续工具切换复用这批上下文。

## 2.2 一开始就独立路由的痛点（在 Pages Router 下）

1. 页面级组件会卸载重建

- `web/src/pages/_app.page.tsx` 是 `<Component {...props} />` 模式。
- 跨页面跳转本质是换页面组件树，不是同页切子组件。

1. 重区块（右侧 assets）容易重建

- 如果仍放在各页面内，会重新 mount，体验抖动明显。

1. 工作台逻辑分散

- 新增一个工具通常要做“SEO页 + `/app` formConfig + app SSR 聚合配置 + 菜单双维护”。

---

## 3. `/app` 模式后来产生了哪些缺点

1. 双维护成本高

- 菜单两份：`useMenuList`（app） + `useCompactMenuList`（SEO）。
- 渲染两份：`formConfig`（app） + 各独立页面 Hero/Form。
- 数据两份：`app/_constants/serverRequestConfig.ts` + 各页面 `getServerSideProps`。

1. 路由与语义复杂

- 有 `/app?target=` + `/app/*` + 重写到 `/xxx` 并存，理解和排障成本高。

1. 代码分叉增多

- `useInflowRouteQueryStoreSelector`、`setInFlowTargetQueryParams`、`handleInflowUrl`、`useIsInApps` 在大量模块形成“inflow 特化路径”。

1. 可维护性风险

- 新增能力时容易出现 app/seo 不一致、埋点/文案/路由映射不一致。

---

## 4. 目标改造：去除登录后 `/app` 层，统一到独立路由

目标解读：

- 登录前后都使用独立路由（按当前 SEO 路由形态）。
- 左侧菜单样式与左侧表单能力“向已登录版对齐”。
- 右侧：未登录展示社区资源；已登录展示用户 assets（能力与当前 `InflowRightContent` 对齐）。
- 工具路由互切时，右侧 assets 不刷新（至少体感不抖、不重载）。

---

## 5. “未登录与已登录侧边栏按钮是否完全一致一一对应？”

结论：

- 主干一级菜单在当前代码里是 **15 项一一对应（可映射）**。
- 但不是“完全等价”：行为与激活规则明显不同，且 compact 菜单还有本地工具扩展逻辑。

## 5.1 一一对应（15 项）

| 已登录 type (`useMenuList`) | 未登录 route (`useCompactMenuList`) |
| --- | --- |
| `text-to-image` | `/ai-image-generator` |
| `image-to-image` | `/image-to-image-ai` |
| `photo-effects` | `/photo-effects` |
| `image-tools` | `/image-tools` |
| `image-to-video` | `/image-to-video` |
| `text-to-video` | `/text-to-video` |
| `reference-to-video` | `/reference-to-video` |
| `ai-avatar` | `/ai-avatar` |
| `use-cases` | `/use-cases` |
| `mimic-motion` | `/mimic-motion` |
| `ai-video-editor` | `/ai-video-editor` |
| `video-to-video` | `/video-to-video` |
| `ai-animation-generator` | `/ai-animation-generator` |
| `video-effects` | `/video-effects` |
| `tool` | `/tool` |

## 5.2 关键不一致点

1. 点击行为不同

- 已登录：改 store（`setInFlowTargetQueryParams`）。
- 未登录：`Link` 路由跳转。

1. 激活判断复杂度不同

- 已登录：`getActiveMenu(type, targetQuery)` 基于 target。
- 未登录：`isActiveMenu(...)` 含大量路径特判（`/app/*`、`mapRoute`、localTools 等）。

1. 扩展能力不同

- 未登录 compact 支持 `useLocalTools` 动态外挂。
- 已登录菜单含 chat-mode 支持字段（`supportChatMode`）。

因此：

- “菜单项可以一一映射”是对的。
- “两边完全一致”不对，统一时必须重做菜单协议（同时有 `type + route`）。

---

## 6. 要实现“登录后去掉 /app 且 assets 切路由不刷新”，需要考虑哪些方面

## 6.1 先定“什么叫不刷新”

建议明确验收标准（否则容易争论）：

- A. 组件实例不卸载（最严格）
- B. 允许卸载，但列表数据、滚动位置、选中项、生成状态秒恢复（中等）
- C. 只要求数据不丢（最低）

## 6.2 Pages Router 的现实约束

- 跨独立页面路由时，页面组件通常会重建。
- 当前项目没有显式 `getLayout` 持久化实现证据；`withLayouts` 是否跨页面保留实例需单独验证。
- 因此不能把“共享同名 layout 就一定不卸载”当既定事实。

---

## 7. 精确到 hooks/context/store 的改造点清单

## 7.1 高优先级（会直接影响路由统一）

1. Inflow Query 体系（可逐步下线）

- `web/src/pages/pollo.ai/_context/InflowQuery/store.ts`
- `web/src/pages/pollo.ai/_context/InflowQuery/QuerySyncProvider.tsx`
- `web/src/pages/pollo.ai/_context/InflowQuery/hooks/useInflowRouteQueryStoreSelector.ts`
- 关联替换：`setInFlowTargetQueryParams` 调用点（多处）

1. inflow URL 构造体系

- `web/src/pages/pollo.ai/_helpers/handleInflowUrl.ts`
- `web/src/pages/pollo.ai/_hooks/useGenerateUrl/index.ts`
- 需要改成 route-first（独立路由优先，保留必要 query）

1. app 工作台聚合 SSR

- `web/src/pages/pollo.ai/app/_utils/getSsrData.ts`
- `web/src/pages/pollo.ai/app/_utils/serverRequest.ts`
- `web/src/pages/pollo.ai/app/_constants/serverRequestConfig.ts`
- 改为“各工具页按需 SSR + 共享 helper”

## 7.2 左侧菜单/表单统一需要改动

1. 菜单协议统一

- 已登录：`useMenuList.tsx`（type 驱动）
- 未登录：`useCompactMenuList.tsx`（route 驱动）
- 目标：统一为 `[{type, route, tabType, supportChatMode, ...}]`

1. 激活判断统一

- 合并 `app/_home/helper/getActiveMenu.ts` 与 `LeftCompactMenu/helper/index.ts`
- 产出单一 `resolveActiveMenu(pathname, query)`

1. 表单分发统一

- `app/_constants/formConfig.tsx` 迁移为“独立路由可复用的渲染注册表”
- 由 route 映射到 type（而不是 query.target 驱动）

## 7.3 右侧 assets 持续性相关状态层

1. 右侧组件本体

- `web/src/pages/pollo.ai/_components/InflowRightContent/index.tsx`

1. 数据状态

- `web/src/pages/pollo.ai/_store/storeSlice/creationRecords.ts`（全局 Zustand，内存态）
- `web/src/hooks/useCreationRecordsV2.ts`（记录拉取、分页、更新、删除、事件）

1. 仍依赖 inflow query 的部分（需去耦）

- `useChatMode`（依赖 `targetQuery`）
- `InflowRightContent` 内对 `targetQuery` 的依赖
- 若去掉 `/app?target`，要改为 route/type 驱动

1. 存储策略现状

- `creationRecords` 是全局内存态（页面不刷新可保留，刷新会丢）
- `projectId` 已有 `localStorage` 持久化（`projectIdStore`）

## 7.4 不能简单替换的点（重要）

- `useIsInApps` 不是登录判断，它是 `/app/:slug` 路由识别器，不能直接全部替成 `useSession()`。

---

## 8. 可选实施方案（从保守到激进）

## 方案 A：右侧容器“壳层常驻”，左侧表单按路由重建（推荐现实方案）

做法：

- 在共享上层布局中放右侧容器（只在工具路由显示）。
- 左侧表单继续按页面路由渲染。
- 页面与右侧通过全局 store/event 通信，不走 props 级联。

优点：

- 最接近“assets 不刷新”。
- 对 SEO 路由改造影响可控。

风险：

- 需要验证 layout 是否真能跨目标路由保持实例。
- 需要补齐 route 白名单与移动端显隐策略。

## 方案 B：允许右侧重挂载，但做“状态秒恢复”

做法：

- 接受 `InflowRightContent` 组件重建。
- 强化 `creationRecords` + UI 状态（滚动、筛选、tab）持久化，恢复做到无感。

优点：

- 实施难度中等，和现有 Pages Router 兼容性最好。

缺点：

- WebSocket/任务态仍可能有短暂抖动，需要补偿逻辑。

## 方案 C：重构到 App Router 并行槽位（长期终局）

做法：

- 使用 Parallel Routes/slots 让右侧槽位持久，左侧页面可切换。

优点：

- 架构上最干净。

缺点：

- 改造成本最高，不适合当前快速收敛目标。

---

## 9. 推荐推进路径（建议）

Phase 1（2-4 天）：事实验证 + 协议收敛

1. 验证 `withLayouts` 跨独立页面是否保留实例（用 mount/unmount 日志）。
2. 定义统一菜单协议：`type + route`。
3. 定义 route->type 映射表，替代 `targetQuery` 作为主驱动。

Phase 2（并行）：菜单与右侧先落地

1. 左侧统一到一套组件（样式按已登录，点击走 Link）。
2. 右侧 assets 单独壳层化，接管通信通道（store/emitter）。
3. 去除 `InflowRightContent/useChatMode` 对 inflow query 的强依赖。

Phase 3：逐步拆除 `/app` 体系

1. 清理 `QuerySyncProvider` 与 inflow URL helper 依赖。
2. 下线 app SSR 聚合大锅，回收为工具页按需 SSR。
3. 清理 rewrites/redirects 与埋点中的 `/app` 语义。

---

## 10. 我建议你们先确认的关键问题（请回复）

1. 本次统一是否包含 `/app/[...params]` 的 agent/extensions 子系统，还是仅工具工作台（tool/image-tools/effects/generators）？
先只做工具工作台
2. “assets 不刷新”验收标准是 A（实例不卸载）还是 B（允许卸载但秒恢复）？
A（实例不卸载）
3. 未登录右侧“社区资源”是否直接复用各页面现有模块，还是做统一 CommunityContent 容器？
直接复用各页面现有模块
4. chat 模式是否必须在所有 15 个工具路由统一可用，还是先覆盖原支持的 5 个菜单项？
先覆盖原支持的 5 个菜单项
5. 历史链接兼容策略：`/app?target=...` 是否需要长期 301 到新独立路由，还是短期内部 rewrite 即可？
直接抛弃 /app?target=...理由

---

## 11. 最终结论（一句话）

`/app?target=` 当初是为“工作台高交互与状态常驻”而生；现在痛点来自双路由双数据流双菜单维护。要安全回归独立路由，关键不是简单删 `/app`，而是先统一“菜单协议 + 右侧状态层 + route 驱动模型”，再分阶段拆掉 inflow query 体系。
