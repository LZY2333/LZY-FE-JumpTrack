# Pollo 左侧菜单登录/未登录双入口链路与复用梳理

## 结论先行

同样点击左侧 `Txt2Img`，登录与未登录走的是两套菜单系统：

- 登录（信息流工作台）：`/app?target=...`，本质是 **改 Inflow Query Store -> URL 同步**
- 未登录（SEO/普通页）：`/xxx`，本质是 **直接 Link 跳转**

这不是“同一逻辑分支”，而是“同一交互外观下的两套入口架构”。

---

## 1) 已登录（/app）调用链：Txt2Img -> TextToImageFormGenerate

### 1.1 菜单项定义（目标是 target）

- `Txt2Img` 在 app 菜单里定义为 `type: MENU_LIST_CONST.TEXT_TO_IMAGE`
- 文件：`web/src/pages/pollo.ai/app/_home/LeftMenuLayout/useMenuList.tsx:85`

### 1.2 点击行为（不是 Link，是 setInFlowTargetQueryParams）

- 左侧菜单点击时写入 inflow store：
  - `target: item.type`
  - `code/category` 清空
- 文件：`web/src/pages/pollo.ai/app/_home/LeftMenuLayout/index.tsx:97`

### 1.3 页面主内容根据 target 分发 renderContent

- `MainContent` 读取 `targetQuery`，按 `formConfig[target].render` 渲染
- 文件：`web/src/pages/pollo.ai/app/index.page.tsx:77`

### 1.4 formConfig 命中 TEXT_TO_IMAGE

- 命中后渲染：`<TextToImageFormGenerate entryCode={TextToImage} />`
- 文件：`web/src/pages/pollo.ai/app/_constants/formConfig.tsx:151`

### 1.5 URL 如何变成 /app?target=

- 由 `QuerySyncProvider` 监听 store 变化并 `history.pushState`
- 仅在 `pathname === inflowBaseUrl('/app')` 时生效
- 文件：`web/src/pages/pollo.ai/_context/InflowQuery/QuerySyncProvider.tsx:132`

---

## 2) 未登录（SEO/普通页）调用链：Txt2Img -> /ai-image-generator

### 2.1 菜单项定义（目标是 route）

- `Txt2Img` 在 compact 菜单定义为 `route: '/ai-image-generator'`
- 文件：`web/src/pages/pollo.ai/_components/MenuLayout/LeftCompactMenu/hooks/useCompactMenuList.tsx:30`

### 2.2 点击行为（Link 跳转）

- `LeftCompactMenu` 将菜单项包装为 `<Link href={item.href}>`
- 文件：`web/src/pages/pollo.ai/_components/MenuLayout/LeftCompactMenu/index.tsx:129`
- `CanvasMenuList` 只是调用 `renderListItem`
- 文件：`web/src/components/CanvasMenuList/index.tsx:121`

---

## 3) TextToImageFormGenerate 与 /ai-image-generator 的复用点

## 3.1 最关键复用：同一个表单组件

`/ai-image-generator` 页面并没有另一套“文本生图表单”，最终仍复用 `FormGenerate`：

- 页面入口：`web/src/pages/pollo.ai/ai-image-generator/index.page.tsx:26`
- Hero 中 SEO 场景走 `ImageGenerateForm`
- 文件：`web/src/pages/pollo.ai/ai-image-generator/Main/_components/Hero/index.tsx:158`
- `ImageGenerateForm` 在 `text-to-image` 分支渲染 `FormGenerate`
- 文件：`web/src/pages/pollo.ai/ai-image-generator/Main/_components/Hero/ImageGenerateForm.tsx:54`

也就是：

- `/app?target=text-to-image` -> `formConfig` -> `TextToImageFormGenerate`
- `/ai-image-generator` -> `Hero` -> `ImageGenerateForm` -> `TextToImageFormGenerate`

最终核心表单是同一份实现。

## 3.2 Context/Store 也复用同一体系

两条入口都依赖 `Text2ImageGeneratorContext` 生态：

- app 页面注入 `Text2ImageGeneratorContext.Provider`
  - `web/src/pages/pollo.ai/app/index.page.tsx:210`
- ai-image-generator 页面注入相同 Provider
  - `web/src/pages/pollo.ai/ai-image-generator/index.page.tsx:32`

## 3.3 TextToImageFormGenerate 使用的 ai-image-generator 目录资源

直接/间接依赖的关键资源（只列核心）：

1. `DEFAULT_STYLE`

- `web/src/pages/pollo.ai/ai-image-generator/_helpers/styles.common`
- 引用点：`web/src/pages/pollo.ai/ai-image-generator/Main/_components/FormGenerate/index.tsx:13`

1. 模型免费态判断 `useModelIsFree`

- `web/src/pages/pollo.ai/ai-image-generator/_hooks/useModelIsFree`
- 引用点：`web/src/pages/pollo.ai/ai-image-generator/Main/_components/FormGenerate/PureForm/index.tsx:11`

1. Text2Image Store hooks（样式/Lora）

- `web/src/pages/pollo.ai/ai-image-generator/_store/*`
- 被字段组件消费：`ProFormStyle` / `ProFormLoRA`
- 相关检索：`useText2ImageStyles`、`useText2ImageLoraCategories`

1. 表单内部资源（同目录）

- `adapter.ts`、`schema.ts`、`PureForm/index.tsx`
- 引用点：`web/src/pages/pollo.ai/ai-image-generator/Main/_components/FormGenerate/index.tsx:25`

---

## 4) 本项目“同一功能双入口（inflow + 直达页面）”模块总表

说明：

- inflow 入口统一起点：
  - 菜单 type 定义：`web/src/pages/pollo.ai/app/_home/LeftMenuLayout/useMenuList.tsx`
  - 点击写 store：`web/src/pages/pollo.ai/app/_home/LeftMenuLayout/index.tsx:97`
  - 渲染分发：`web/src/pages/pollo.ai/app/_constants/formConfig.tsx`
- 直达入口统一起点：
  - route 定义：`web/src/pages/pollo.ai/_components/MenuLayout/LeftCompactMenu/hooks/useCompactMenuList.tsx`
  - Link 跳转：`web/src/pages/pollo.ai/_components/MenuLayout/LeftCompactMenu/index.tsx:129`

| 模块 | Inflow 渲染入口 | 直达页面入口 |
| --- | --- | --- |
| Text to Image | `formConfig.tsx` -> `TEXT_TO_IMAGE` | `web/src/pages/pollo.ai/ai-image-generator/index.page.tsx` |
| Image to Image | `formConfig.tsx` -> `IMAGE_TO_IMAGE` | `web/src/pages/pollo.ai/image-to-image-ai/index.page.tsx` |
| Image to Video | `formConfig.tsx` -> `IMAGE_TO_VIDEO` | `web/src/pages/pollo.ai/image-to-video/index.page.tsx` |
| Text to Video | `formConfig.tsx` -> `TEXT_TO_VIDEO` | `web/src/pages/pollo.ai/text-to-video/index.page.tsx` |
| Reference to Video | `formConfig.tsx` -> `CONSISTENT_CHARACTER_VIDEO` | `web/src/pages/pollo.ai/consist

ent-character-video/index.page.tsx` |
| Video to Video | `formConfig.tsx` -> `VIDEO_TO_VIDEO` | `web/src/pages/pollo.ai/video-to-video/index.page.tsx` |
| AI Animation | `formConfig.tsx` -> `AI_ANIMATION` | `web/src/pages/pollo.ai/ai-animation-generator/index.page.tsx` |
| AI Photo Effects | `formConfig.tsx` -> `PHOTO_EFFECTS` | `web/src/pages/pollo.ai/photo-effects/index.page.tsx` |
| AI Video Effects | `formConfig.tsx` -> `VIDEO_EFFECTS` | `web/src/pages/pollo.ai/template/index.page.tsx`（承载`/video-effects`） |
| AI Image Tools |`formConfig.tsx` -> `IMAGE_TOOLS` | `web/src/pages/pollo.ai/image-tools/index.page.tsx` |
| AI Video Tools | `formConfig.tsx` -> `TOOL` | `web/src/pages/pollo.ai/tool/index.page.tsx` |
| AI Avatar | `formConfig.tsx` -> `AI_AVATAR` | `web/src/pages/pollo.ai/ai-avatar/index.page.tsx` |
| Mimic Motion | `formConfig.tsx` -> `MOTION_IMITATION` | `web/src/pages/pollo.ai/mimic-motion/index.page.tsx` |
| AI Video Editor | `formConfig.tsx` -> `AI_VIDEO_EDIT` | `web/src/pages/pollo.ai/ai-video-editor/index.page.tsx` |
| Apps / Use Cases | `formConfig.tsx` -> `USE_CASES` | `web/src/pages/pollo.ai/use-cases/index.page.tsx` |

补充：

- `IMAGE_GENERATORS_TOOL`、`AI_PRODUCT_AVATAR` 是 inflow 内二级能力，不是 left compact 一级菜单直达项，因此不归入“左侧一级菜单双入口”主表。
