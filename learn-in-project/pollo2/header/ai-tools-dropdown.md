# AI Tools 下拉菜单改造分析

> Figma: https://www.figma.com/design/KQ9bDgtprgbJqu9mJhgcDY/Pollo-Home%5CExplore%5CAssects?node-id=94210-74911
> 代码文件: `web/src/pages/pollo.ai/_layout/Header/HeaderMenu/menu.tsx` (第 734-943 行)

## 设计稿结构

下拉面板为两栏布局，左右分别为 Video Tools 和 Image Tools：

```
┌─────────────────────────────────────────────────┐
│  🎬 Video Tools          │  🖼 Image Tools       │
│  ─────────────────       │  ─────────────────    │
│  AI Video Upscaler       │  AI Art Generator     │
│  AI Video Enhancer       │  Background Remover   │
│  Video to Anime Converter│  Object Remover       │
│  AI Video Filters        │  Image Enhancer       │
│  AI Dance Generator      │  AI Image Extender    │
│  Anime Video Enhancer    │  Anime Enhancer       │
│  View More >             │  View More >          │
└─────────────────────────────────────────────────┘
```

### 设计稿样式要点

- 面板背景: `#18181F`，圆角 12px，阴影 `0px 20px 38px rgba(0,0,0,0.48)`
- 两栏间距: 64px，内边距: 24px
- 分类标题: Inter 16px/24px 600（加粗），颜色 `#FFFFFF`，前带图标
- 标题与列表之间有分割线（`rgba(255,255,255,0.04)` 1px）
- 列表项: Inter 14px/20px 400，颜色 `rgba(255,255,255,0.85)`，圆角 8px，padding 6px 8px
- "View More": Inter 14px/20px 400，颜色 `rgba(255,255,255,0.4)`，右侧带箭头图标

---

## 差异对比

### Video Tools

| # | 当前代码 | Figma 设计 | 变更 |
|---|---------|-----------|------|
| 1 | AI Video Upscaler | AI Video Upscaler | 无变化 |
| 2 | AI Video Enhancer | AI Video Enhancer | 无变化 |
| 3 | **Video to Anime** | **Video to Anime Converter** | 名称变更 |
| 4 | AI Video Filters | AI Video Filters | 无变化 |
| 5 | AI Dance Generator | AI Dance Generator | 无变化 |
| 6 | Anime Video Enhancer | Anime Video Enhancer | 无变化 |

### Image Tools

| # | 当前代码 | Figma 设计 | 变更 |
|---|---------|-----------|------|
| 1 | Remove BG (`/background-remover`) | **AI Art Generator** | **新增项，需确认路由** |
| 2 | Object Remover (`/object-remover`) | **Background Remover** | 原 "Remove BG" 改名 |
| 3 | Image Enhancer (`/image-enhancer`) | Object Remover | 顺序调整 |
| 4 | Ghibli AI Generator (`/photo-effects/ghibli-ai`) | Image Enhancer | 顺序调整 |
| 5 | Anime Upscaler (`/anime-upscaler`) | **AI Image Extender** | **新增项，需确认路由** |
| 6 | Image Generators (`/image-generators`) | **Anime Enhancer** | **改名，需确认路由** |

### 新增功能

- 每个分类底部新增 **"View More >"** 链接（Video Tools → `/tool`，Image Tools → `/image-tools`）

---

## 待确认事项

1. **AI Art Generator** 对应的路由链接是什么？
2. **AI Image Extender** 对应的路由链接是什么？
3. **Anime Enhancer** 是否复用原 Anime Upscaler 的路由 `/anime-upscaler`？
4. 原有的 **Ghibli AI Generator** 和 **Image Generators** 是否从下拉菜单中移除？
5. "View More" 是否需要新增数据字段支持，还是直接使用 `groupHref`？

---

## 涉及文件

- `web/src/pages/pollo.ai/_layout/Header/HeaderMenu/menu.tsx` — 菜单数据配置
- `web/src/pages/pollo.ai/_layout/Header/HeaderList/GroupList/index.tsx` — PC 端下拉渲染（可能需要加 "View More"）
- `web/src/pages/pollo.ai/_layout/Header/HeaderList/GroupList/MobileGroupList.tsx` — 移动端下拉渲染
