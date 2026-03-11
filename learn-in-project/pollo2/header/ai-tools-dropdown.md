# AI Tools 下拉菜单改造分析

> Figma: https://www.figma.com/design/KQ9bDgtprgbJqu9mJhgcDY/Pollo-Home%5CExplore%5CAssects?node-id=94210-74911
> 代码文件: `web/src/pages/pollo.ai/_layout/Header/HeaderList/GroupList/index.tsx`

## 需求说明

**所有菜单项（名称、链接、顺序）均不修改**，仅将下拉面板的颜色样式对齐 Figma 设计稿。

## 修改计划

### 文件: `GroupList/index.tsx`

| #   | 元素             | 当前代码                           | Figma 目标值            | 修改为                   |
| --- | ---------------- | ---------------------------------- | ----------------------- | ------------------------ |
| 1   | 分类标题文字     | `text-f-primary`（`#FF3466` 粉红） | `#FFFFFF`（纯白）       | `text-f-text`            |
| 2   | 列表项圆角       | `rounded`（4px）                   | 8px                     | `rounded-lg`             |
| 3   | "View More" 文字 | `text-f-primary`（`#FF3466` 粉红） | `rgba(255,255,255,0.4)` | `text-f-text-quaternary` |

/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderList/AiList/index.tsx:40 — 主组件（Video AI / Image AI 共用）

### 无需修改（已匹配）

| 元素              | 当前值                                                  | Figma 值                         |
| ----------------- | ------------------------------------------------------- | -------------------------------- |
| 面板背景          | `bg-f-bg-container`（`#18181F`）                        | `#18181F`                        |
| 面板边框          | `border-f-border-secondary`（`rgba(255,255,255,0.04)`） | `rgba(255,255,255,0.04)`         |
| 面板阴影          | `shadow-[0_20px_38px_0_rgba(0,0,0,0.48)]`               | `0px 20px 38px rgba(0,0,0,0.48)` |
| 面板圆角          | `rounded-xl`（12px）                                    | 12px                             |
| 分割线            | `border-f-border-secondary`                             | `rgba(255,255,255,0.04)`         |
| 列表项文字        | `text-f-text-secondary`（`rgba(255,255,255,0.85)`）     | `rgba(255,255,255,0.85)`         |
| 列表项 hover 文字 | `hover:text-f-primary`                                  | 保持                             |
| 列表项 hover 背景 | `hover:bg-f-bg-base`                                    | 保持                             |
