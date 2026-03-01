# Pollo.ai 路由统一改造执行方案（已锁定决策版）

> 本文是基于你已确认的 5 个决策，输出可直接拆任务的执行计划。

---

## 0. 已锁定决策（不可再漂移）

1. 改造范围：只做工具工作台，不包含 `/app/[...params]` agent/extensions 子系统。  
2. 右侧 assets 验收：A 标准，组件实例不卸载。  
3. 未登录右侧内容：直接复用各页面现有社区模块，不新增统一 CommunityContent 容器。  
4. Chat 模式：第一阶段仅覆盖原支持的 5 个菜单项。  
5. 历史链接策略：直接废弃 `/app?target=...`（不做长期兼容）。

---

## 1. 目标状态（改造完成后）

1. 登录/未登录统一走独立路由（`/ai-image-generator`、`/image-to-video`...）。
2. 左侧菜单样式与交互按已登录能力统一（但点击行为改为 `Link/router.push`）。
3. 左侧表单渲染能力继续复用原 app `formConfig` 体系（route 驱动，不再 target 驱动）。
4. 右侧 `InflowRightContent` 在工具路由切换时实例不卸载。
5. `/app?target=...` 链路及依赖（QuerySync/handleInflowUrl）从主链路移除。

---

## 2. 里程碑与任务拆分

## Milestone A：壳层与路由基建（先保证“不卸载”）

### A1. 新建工具壳层 Layout（只用于 15 个工具路由）
- 新增：`web/src/pages/pollo.ai/_layout/layouts/ToolWorkbenchLayout/index.tsx`
- 结构：`LeftUnifiedMenu + LeftFormSlot(children) + RightAssetsSlot(InflowRightContent)`
- 注意：仅工具路由使用，避免污染 `pricing/profile/assets/...`。

### A2. 右侧实例保活验证（必须先做）
- 在 `InflowRightContent` 增加开发期 mount/unmount 埋点日志（dev only）。
- 工具路由互切 30 次，验证无 unmount。

### A3. 工具路由白名单
- 新增常量：`web/src/pages/pollo.ai/_constants/toolRoutes.ts`
- 包含当前 15 项：
  - `/ai-image-generator`
  - `/image-to-image-ai`
  - `/photo-effects`
  - `/image-tools`
  - `/image-to-video`
  - `/text-to-video`
  - `/reference-to-video`（映射到 consistent-character-video）
  - `/ai-avatar`
  - `/use-cases`
  - `/mimic-motion`
  - `/ai-video-editor`
  - `/video-to-video`
  - `/ai-animation-generator`
  - `/video-effects`
  - `/tool`

验收：
- 工具路由显示右侧 assets；非工具路由不显示。
- 工具路由互切时右侧不卸载。

---

## Milestone B：左侧菜单统一（type + route 协议）

### B1. 统一菜单数据模型
- 新增：`web/src/pages/pollo.ai/_components/MenuLayout/UnifiedMenu/types.ts`
- 字段：`type`, `route`, `tabType`, `iconClassName`, `buttonName`, `supportChatMode`。

### B2. 合并两份菜单源
- 读取来源：
  - `app/_home/LeftMenuLayout/useMenuList.tsx`
  - `_components/MenuLayout/LeftCompactMenu/hooks/useCompactMenuList.tsx`
- 产出单一配置：`web/src/pages/pollo.ai/_components/MenuLayout/UnifiedMenu/config.ts`

### B3. 合并激活逻辑
- 合并：
  - `app/_home/helper/getActiveMenu.ts`
  - `LeftCompactMenu/helper/index.ts`
- 输出：`resolveActiveMenu(pathname, route, type, mapRoute)`。

### B4. 替换 UI 容器
- 工具壳层改用 `UnifiedLeftMenu`。
- 点击统一走独立路由跳转，不再调用 `setInFlowTargetQueryParams`。

验收：
- 15 项菜单可点击可高亮。
- 支持原本 5 项 chat-mode 菜单能力。

---

## Milestone C：左侧表单 route 驱动（替换 target 驱动）

### C1. route -> menuType 映射
- 新增：`web/src/pages/pollo.ai/_constants/routeToMenuType.ts`
- 将 pathname 转为 `MENU_LIST_CONST`。

### C2. formConfig 改为可复用注册表
- 原：`web/src/pages/pollo.ai/app/_constants/formConfig.tsx`
- 改造目标：可在独立路由页面按 `menuType` 调用 `render(...)`。

### C3. 抽离 App 特化依赖
- 重点去耦：
  - `useInflowRouteQueryStoreSelector`（target/code/category）
  - app 内 `MainContent` 对 inflow query 的读取
- 替换为：route params + page props。

验收：
- 15 条工具路由各自左侧表单渲染与旧 app 功能一致。

---

## Milestone D：移除 inflow query 主链路

### D1. 下线主链路引用
- 逐步替换并清理：
  - `web/src/pages/pollo.ai/_context/InflowQuery/QuerySyncProvider.tsx`
  - `web/src/pages/pollo.ai/_context/InflowQuery/store.ts`
  - `web/src/pages/pollo.ai/_context/InflowQuery/hooks/useInflowRouteQueryStoreSelector.ts`

### D2. URL 生成体系改造
- 改造：
  - `web/src/pages/pollo.ai/_helpers/handleInflowUrl.ts`
  - `web/src/pages/pollo.ai/_hooks/useGenerateUrl/index.ts`
- 目标：统一生成独立路由 URL，不再生成 `/app?target=...`。

### D3. 清理 `/app` 重写与入口引用
- 检查：`packages/hosts/src/sites/pollo.ai.ts` 中 `/app/*` rewrites。
- 去除工具主链路 `/app/*` 入口（保留 agent/extensions 范围内必要配置）。

验收：
- 工具主流程不依赖 inflow query。
- 新功能入口不再出现 `/app?target=...`。

---

## Milestone E：SSR 与数据层收口

### E1. 拆分 app 聚合 SSR
- 当前大锅：
  - `app/_utils/getSsrData.ts`
  - `app/_utils/serverRequest.ts`
  - `app/_constants/serverRequestConfig.ts`
- 目标：公共 helper + 各工具路由按需 SSR。

### E2. 右侧数据连续性保障
- 主要依赖：
  - `web/src/pages/pollo.ai/_store/storeSlice/creationRecords.ts`
  - `web/src/hooks/useCreationRecordsV2.ts`
- 确保工具路由切换不触发右侧实例销毁和状态重置。

验收：
- 右侧 records、滚动、进行中任务在工具切换中连续。

---

## 3. 必改文件清单（首批）

1. `web/src/pages/pollo.ai/_components/InflowRightContent/index.tsx`
2. `web/src/pages/pollo.ai/app/_constants/formConfig.tsx`
3. `web/src/pages/pollo.ai/app/_home/LeftMenuLayout/useMenuList.tsx`
4. `web/src/pages/pollo.ai/_components/MenuLayout/LeftCompactMenu/hooks/useCompactMenuList.tsx`
5. `web/src/pages/pollo.ai/_components/MenuLayout/LeftCompactMenu/helper/index.ts`
6. `web/src/pages/pollo.ai/app/_home/helper/getActiveMenu.ts`
7. `web/src/pages/pollo.ai/_context/InflowQuery/QuerySyncProvider.tsx`
8. `web/src/pages/pollo.ai/_helpers/handleInflowUrl.ts`
9. `web/src/pages/pollo.ai/_hooks/useGenerateUrl/index.ts`
10. `packages/hosts/src/sites/pollo.ai.ts`

---

## 4. 测试矩阵（必须覆盖）

1. 功能回归
- 15 工具路由左侧表单可用。
- 未登录右侧展示各页面原社区模块。
- 已登录右侧展示 assets 且持续可操作。

2. 保活回归
- 工具间切换 30 次，`InflowRightContent` 无 unmount。
- 正在生成任务不中断。

3. Chat 模式
- 仅 5 项支持路由生效，其余不展示 chat 特化。

4. 路由回归
- 不再产生 `/app?target=` 链接。
- 旧入口访问行为符合“直接废弃”策略（返回统一兜底页或新入口）。

---

## 5. 风险与回滚

1. 风险：保活失败（withLayouts 在跨页面不保实例）
- 回滚策略：临时降级到“B 秒恢复”方案，保证业务上线。

2. 风险：菜单高亮错乱
- 回滚策略：保留旧 helper 并开启双轨日志比较。

3. 风险：历史链接失效引发用户投诉
- 回滚策略：对高频来源补短期重定向映射（不恢复 query 模式）。

---

## 6. 建议的 PR 切分

1. PR-1：ToolWorkbenchLayout + 右侧保活验证 + 工具路由白名单
2. PR-2：UnifiedMenu（数据协议、激活逻辑、点击跳转）
3. PR-3：formConfig route 驱动改造（含 15 路由接入）
4. PR-4：inflow query 依赖下线（QuerySync/handleInflowUrl/useGenerateUrl）
5. PR-5：SSR 聚合拆分与 rewrites 清理

---

## 7. 一句话执行原则

先保右侧，再统一菜单，再迁表单，最后拆 inflow。不要反过来。

---

## 8. PR-1 代码级改动清单（函数级）

> 目标：先实现“工具路由间切换时右侧 `InflowRightContent` 不卸载”，暂不改菜单协议与表单分发模型。

### 8.1 新增工具路由白名单

- 新文件：`web/src/pages/pollo.ai/_constants/toolRoutes.ts`
- 导出：
  - `TOOL_ROUTE_PREFIXES`（15 项）
  - `isToolWorkbenchRoute(pathname: string): boolean`

### 8.2 新增工作台壳层布局

- 新文件：`web/src/pages/pollo.ai/_layout/layouts/ToolWorkbenchLayout/index.tsx`
- 新组件：
  - `ToolWorkbenchLayout: React.FC<{ children: ReactNode; formilyEntryCode?: string }>`
- 内部职责：
  - 左侧：先复用 `LeftCompactMenu`（过渡）
  - 中间：`children`
  - 右侧：`InflowRightContent`
  - 非工具路由直接 `return <>{children}</>`
- 关键控制：
  - 用 `useUrl().pathname` + `isToolWorkbenchRoute` 控制挂载
  - 将 `InflowRightContent` 提升至壳层，避免随页面切换重建

### 8.3 右侧组件 mount/unmount 观测（仅开发）

- 文件：`web/src/pages/pollo.ai/_components/InflowRightContent/index.tsx`
- 添加：
  - `useEffect(() => { if (process.env.NODE_ENV !== 'production') console.log('[InflowRightContent] mount'); return () => console.log('[InflowRightContent] unmount') }, [])`

### 8.4 接入到工具页面的 `withLayouts`

- 首批验证页面（先 4 个）：
  - `web/src/pages/pollo.ai/ai-image-generator/index.page.tsx`
  - `web/src/pages/pollo.ai/image-to-video/index.page.tsx`
  - `web/src/pages/pollo.ai/text-to-video/index.page.tsx`
  - `web/src/pages/pollo.ai/tool/index.page.tsx`
- 改动方式：
  - 在 `withLayouts(Page, [...])` 中增加 `ToolWorkbenchLayout`
  - 位置建议在 `DefaultLayout` 内层、页面组件外层

### 8.5 临时防重复渲染

- 若页面内部已有右侧区域，先通过路由条件或开关短路页面内旧右侧实现，保留壳层唯一实例
- 建议临时开关名：`disableInternalRightPanel`

### 8.6 PR-1 验收标准

1. 在 4 个验证页面来回切换 30 次，控制台仅出现 1 次 `mount`，无 `unmount`。
2. 已登录状态下右侧 assets 连续可用，切换不白屏、不重置。
3. 非工具路由（如 `/pricing`）不展示右侧区域。
4. 不影响 `/app/[...params]` agent/extensions 子系统行为。

### 8.7 PR-1 提交顺序

1. `toolRoutes.ts` + `ToolWorkbenchLayout`
2. `InflowRightContent` dev 观测日志
3. 4 个核心页面接入并验证
4. 扩展到其余 11 个工具页面

