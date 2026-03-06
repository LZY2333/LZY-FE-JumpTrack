# Pollo 2.0 Apps 聚合页合并方案

## 合并目标

将以下五类内容统一收纳到 Apps 聚合页（`/app`）：

| 分类         | 当前入口                                                                           | 合并后归属                                  |
| ------------ | ---------------------------------------------------------------------------------- | ------------------------------------------- |
| Use Case     | 顶部导航 Apps (`/use-cases`)                                                       | Apps 聚合页                                 |
| Vibe Feature | 仅 Home 页 (`/app/motion` 等)                                                      | Apps 聚合页                                 |
| Agent        | 侧边栏/Footer (`/app/ai-ugc-video-generator` 等)                                   | Apps 聚合页                                 |
| Tools        | 顶部导航 AI Tools (`/tool`、`/image-tools`)                                        | Apps 聚合页 (Video Tools / Image Tools tab) |
| Effects      | 顶部导航 Effects + 侧边栏 (`/app/pro-effects`、`/video-effects`、`/photo-effects`) | Effects 聚合页 (`/effects`)                 |

## 内容清单

### Use Case

当前路径：`/use-cases`，信息流后台 `/app` 侧边栏 type = `use-cases`

| 功能名                   | code                       | 类型 |
| ------------------------ | -------------------------- | ---- |
| Birthday Video Maker     | `birthday-video-maker`     | I2V  |
| Tribute Video Maker      | `tribute-video-maker`      | I2V  |
| Anniversary Video Maker  | `anniversary-video-maker`  | I2V  |
| Christmas Video Maker    | `christmas-video-maker`    | I2V  |
| Boomerang Video Maker    | `boomerang-video-maker`    | I2V  |
| Photo Video Maker        | `photo-video-maker`        | I2V  |
| Youtube Outro Maker      | `youtube-outro-maker`      | T2V  |
| Gaming Intro Maker       | `gaming-intro-maker`       | T2V  |
| AI Clip Maker            | `ai-clip-maker`            | T2V  |
| Real Estate Video Maker  | `real-estate-video-maker`  | T2V  |
| Prompt to Video          | `prompt-to-video`          | T2V  |
| Movie Trailer Maker      | `movie-trailer-maker`      | T2V  |
| Travel Video Maker       | `travel-video-maker`       | T2V  |
| AI Human Video Generator | `ai-human-video-generator` | T2V  |
| Teaser Video Maker       | `teaser-video-maker`       | T2V  |
| Holiday Video Maker      | `holiday-video-maker`      | T2V  |
| AI B-Roll Generator      | `ai-b-roll-generator`      | T2V  |
| Facebook Video Maker     | `facebook-video-maker`     | T2V  |
| Instagram Video Maker    | `instagram-video-maker`    | T2V  |
| Family Video Maker       | `family-video-maker`       | T2V  |
| Video Meme Maker         | `video-meme-maker`         | T2V  |

涉及文件：

- [Use Case 页面入口](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/use-cases/index.page.tsx:1)
- [Use Case code 配置](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/use-cases/_config/app-codes.ts:1)
- [侧边栏 Apps 菜单项](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/_home/LeftMenuLayout/useMenuList.tsx:149)

### Vibe Feature

当前路径：`/app/motion`、`/app/relight`、`/app/angles`，仅 Home 页有入口

| 功能名        | appKey    | 路径           | 描述                            |
| ------------- | --------- | -------------- | ------------------------------- |
| Pollo Motion  | `Motion`  | `/app/motion`  | Create videos programmatically  |
| Pollo Relight | `Relight` | `/app/relight` | Adjust photo lighting & shadows |
| Pollo Angles  | `Angles`  | `/app/angles`  | Change image perspective        |

涉及文件：

- [AppsRouters 路由配置](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/[...params]/_routers/index.ts:1)
- [SEO 配置](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/[...params]/_config/seo.ts:24)
- [Home 页入口 ToolsContent](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/home/_blocks/ToolsContent/index.tsx:34)
- [Vibe Feature 页面组件](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/[...params]/index.page.tsx:1)

### Agent

当前路径：`/app/ai-xxx-video-generator`，通过 `createAgentSEOLayoutPage` 统一创建

| 功能名                   | AgentToolType | 路径                            |
| ------------------------ | ------------- | ------------------------------- |
| AI Viral Video Generator | `ViralVideo`  | `/app/ai-viral-video-generator` |
| AI UGC Video Generator   | `UGC`         | `/app/ai-ugc-video-generator`   |
| AI News Video Generator  | `News`        | `/app/ai-news-video-generator`  |
| AI Music Video Generator | `Music`       | `/app/ai-music-video-generator` |

涉及文件：

- [Agent 路由常量](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/ai-agent/constants.ts:17)
- [UGC 页面](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/ai-ugc-video-generator/index.page.tsx:1)
- [Viral 页面](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/ai-viral-video-generator/index.page.tsx:1)
- [News 页面](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/ai-news-video-generator/index.page.tsx:1)
- [Music 页面](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/ai-music-video-generator/index.page.tsx:1)

### Tools

#### Video Tools

当前路径：顶部导航 groupHref = `/tool`，信息流后台侧边栏 type = `tool`

| 功能名               | 前台 SEO 路径           | toolMap key                  |
| -------------------- | ----------------------- | ---------------------------- |
| AI Video Upscaler    | `/video-upscaler`       | `/tool/video-upscaler`       |
| AI Video Enhancer    | `/video-enhancer`       | `/tool/video-enhancer`       |
| Video to Anime       | `/video-to-anime-ai`    | `/video-to-anime-ai`         |
| AI Video Filters     | `/ai-video-filters`     | `/tool/ai-video-filters`     |
| AI Dance Generator   | `/ai-dance-generator`   | `/tool/ai-dance-generator`   |
| Anime Video Enhancer | `/anime-video-enhancer` | `/tool/anime-video-enhancer` |

#### Image Tools

当前路径：顶部导航 groupHref = `/image-tools`，信息流后台侧边栏 type = `image-tools`

| 功能名              | 前台 SEO 路径              |
| ------------------- | -------------------------- |
| Remove BG           | `/background-remover`      |
| Object Remover      | `/object-remover`          |
| Image Enhancer      | `/image-enhancer`          |
| Ghibli AI Generator | `/photo-effects/ghibli-ai` |
| Anime Upscaler      | `/anime-upscaler`          |
| Image Generators    | `/image-generators`        |

涉及文件：

- [toolMap 配置](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/tool/_components/ToolWrapper/_helper/toolMap.tsx:30)
- [侧边栏 Video Tools 菜单](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/_home/LeftMenuLayout/useMenuList.tsx:197)
- [侧边栏 Image Tools 菜单](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/_home/LeftMenuLayout/useMenuList.tsx:109)
- [顶部导航 AI Tools](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderMenu/menu.tsx:728)

### Effects

当前分为三类：Pro Effects、Video Effects（fun effects）、Photo Effects

#### Pro Effects

当前路径：`/app/pro-effects`，侧边栏无独立入口，顶部导航仅移动端展示

涉及文件：

- [Pro Effects SEO 页面](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/ai-effects/index.page.tsx:39)
- [Pro Effects 分类页](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/ai-effects/[...params]/index.page.tsx:41)
- [左侧紧凑菜单引用](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/MenuLayout/LeftCompactMenu/helper/index.ts:15)
- [Home 页入口](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/home/_blocks/Brand/_block/FeatureEntry/PopularModal/index.tsx:66)

#### Video Effects

当前路径：`/video-effects`（前台）、`/app/video-effects`（后台），侧边栏 type = `video-effects`

#### Photo Effects

当前路径：`/photo-effects`（前台）、`/app/photo-effects`（后台），侧边栏 type = `photo-effects`

合并后：Pro Effects + Video Effects → `/video-effects`，Photo Effects → `/photo-effects`，统一到 Effects 聚合页 `/effects`

涉及文件：

- [侧边栏 Video Effects](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/_home/LeftMenuLayout/useMenuList.tsx:189)
- [侧边栏 Photo Effects](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/_home/LeftMenuLayout/useMenuList.tsx:101)
- [顶部导航 Effects](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderMenu/menu.tsx:333)
- [template 页面（effects 聚合）](//Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/template/index.page.tsx:61)

---

## 术语表

### Use Case

- **介绍**：预设好的视频生成场景模板。用户选择一个 use case（如 Birthday Video Maker），上传图片或输入 prompt，即可一键生成特定场景的视频。本质是对 I2V（图生视频）和 T2V（文生视频）能力的场景化封装。
- **典型特性**：
    - 每个 use case 有独立的 `code`、`samplePrompt`、`defaultModel` 配置
    - 复用通用的 I2V/T2V 生成流程，通过 `EUseCasesCode` 区分场景
    - 页面结构统一：模板选择器 + 表单 + 生成结果
- **典型路径**：
    - 聚合页：`/use-cases`
    - 具体功能：`/use-cases/birthday-video-maker`
    - 信息流后台：`/app` 侧边栏 type = `use-cases`

### Vibe Feature

- **介绍**：Pollo 自研的创意图像/视频处理能力，数量有限（目前仅 3 个），每个都是独立的 AI 模型能力。与 Use Case 的区别在于：Use Case 是场景模板（复用通用模型），Vibe Feature 是独立的 AI 能力。
- **典型特性**：
    - 通过 `AppsRouters` 统一路由配置，`/app/[...params]` 动态页面承载
    - 每个 Vibe Feature 有独立的 `appKey`、SEO 配置、样式配置
    - 当前仅在 Home 页 ToolsContent 区域有入口，无导航栏/侧边栏入口
- **典型路径**：
    - `/app/motion` — Pollo Motion（程序化视频创建）
    - `/app/relight` — Pollo Relight（AI 调光）
    - `/app/angles` — Pollo Angles（AI 换角度）

### Agent

- **介绍**：AI Agent 功能页，用户通过对话式交互生成视频内容。与单点功能不同，Agent 具有上下文记忆、多步骤工作流能力。每个 Agent 针对特定内容类型（UGC、病毒视频、新闻视频、音乐视频）。
- **典型特性**：
    - 通过 `createAgentSEOLayoutPage` + `createAgentSEOServerSideProps` 统一创建页面
    - `AgentToolType` 枚举映射到各 agent 路由
    - 对话式 UI，支持多轮交互和上下文保持
- **典型路径**：
    - `/app/ai-ugc-video-generator` — UGC 视频生成 Agent
    - `/app/ai-viral-video-generator` — 病毒视频生成 Agent
    - `/app/ai-news-video-generator` — 新闻视频生成 Agent
    - `/app/ai-music-video-generator` — 音乐视频生成 Agent

### Tools

- **介绍**：单一功能的 AI 处理工具，输入素材 → AI 处理 → 输出结果，无复杂流程。分为 Video Tools 和 Image Tools 两类。工具页面不是独立文件，而是由 `tool` 模块通过 `toolMap` 统一承载和分发。
- **典型特性**：
    - `toolMap` 配置驱动，每个工具定义 `entryCode`、`initialValues` 等
    - 前台 SEO 路径（如 `/video-upscaler`）与后台工具路径（如 `/tool/video-upscaler`）分离
    - 移动端通过 inflow 机制直接跳转后台，PC 端先到 SEO 页再由按钮跳转
- **典型路径**：
    - Video Tools 聚合：`/tool`（后台）→ 新路径 `/video-tools`
    - Image Tools 聚合：`/image-tools`
    - 具体工具：`/video-upscaler`、`/background-remover` 等

### Effects

- **介绍**：AI 特效滤镜，用户上传图片/视频素材后套用特效生成结果。当前分为三类：Pro Effects（高级特效）、Video Effects / Fun Effects（视频特效）、Photo Effects（图片特效）。改版后 Pro Effects 合并到 Video Effects。
- **典型特性**：
    - Pro Effects：运营通过 CMS 配置特效模板，`/app/pro-effects` 承载
    - Video Effects：`/video-effects/ai-kissing` 等具体特效页，侧边栏 type = `video-effects`
    - Photo Effects：`/photo-effects/ghibli-ai` 等具体特效页，侧边栏 type = `photo-effects`
    - 特效页面支持 SEO，前台路径和后台路径分离（`signInGroupHref`）
- **典型路径**：
    - Pro Effects 聚合：`/app/pro-effects` → 合并到 `/video-effects`
    - Video Effects 聚合：`/video-effects`
    - Photo Effects 聚合：`/photo-effects`
    - Effects 统一聚合页（新）：`/effects`
    - 具体特效：`/video-effects/ai-kissing`、`/photo-effects/ghibli-ai`
