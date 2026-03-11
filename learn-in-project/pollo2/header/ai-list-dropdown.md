# Video AI / Image AI 下拉面板改造分析

> Figma Video AI: https://www.figma.com/design/KQ9bDgtprgbJqu9mJhgcDY?node-id=94210-74835
> Figma Image AI: https://www.figma.com/design/KQ9bDgtprgbJqu9mJhgcDY?node-id=94210-74882
> 共用组件: `web/src/pages/pollo.ai/_layout/Header/HeaderList/AiList/index.tsx`

## 需求说明

**菜单项数据、图片不修改**，仅对齐 Figma 设计稿的布局与字体颜色。
Video AI 和 Image AI 下拉面板设计样式完全一致，共用 `AiList` 组件，一次修改同时生效。

## Figma hover 状态说明

Figma 中以下元素展示的是 **hover 态**（粉色文字 `#FF3466` + 背景 `rgba(255,255,255,0.04)`）：

- 功能入口卡片：Consistent Character Video、Text to Image（hover variant）
- Model 标签：FLUX 1.1 Pro、FLUX Dev Lora（hover 态展示）

## 修改计划

### 文件 1: `AiList/index.tsx`（共 11 处）

#### 面板容器（第 39-44 行）

| #   | 属性   | 当前                             | Figma     | 改为           |
| --- | ------ | -------------------------------- | --------- | -------------- |
| 1   | 背景   | `bg-f-bg-container`（`#18181F`） | `#141419` | `bg-f-bg-base` |
| 2   | 内边距 | `p-6`（24px）                    | 16px      | `p-4`          |
| 3   | 圆角   | `rounded-xl`（12px）             | 24px      | `rounded-3xl`  |

#### 功能入口卡片（第 52-76 行）

| #   | 属性       | 当前                                       | Figma 默认态             | Figma hover 态           | 改为                                         |
| --- | ---------- | ------------------------------------------ | ------------------------ | ------------------------ | -------------------------------------------- |
| 4   | **布局**   | `flex-col`（纵向：图标内嵌标题，描述在下） | `flex-row`（横向：左图右文） | —                    | `flex-row gap-3` + 拆分图标容器与文字容器     |
| 5   | 图标容器   | 无独立容器，24px 伪元素内嵌在标题行        | 独立容器，居中，16px 内边距，12px 圆角，带边框 | — | 新增 `shrink-0 rounded-xl border border-f-border-secondary p-4` 容器 |
| 6   | 标题颜色   | `text-f-primary`（始终粉色）               | `rgba(255,255,255,0.85)` | `#FF3466`                | `text-f-text-secondary hover:text-f-primary` |
| 7   | 内边距     | `py-3 pe-4 ps-3`                           | 12px                     | —                        | `p-3`                                        |
| 8   | 圆角       | `rounded-lg`（8px）                        | 12px                     | —                        | `rounded-xl`                                 |
| 9   | hover 背景 | `hover:bg-f-bg-base`（与新面板同色无效果） | 无背景                   | `rgba(255,255,255,0.04)` | `hover:bg-f-bg-layout`                       |

#### 底部 "Supported Models" 区域（第 79-81 行）

| #   | 属性     | 当前                          | Figma                   | 改为                     |
| --- | -------- | ----------------------------- | ----------------------- | ------------------------ |
| 10  | 标题字号 | `text-sm`（14px）             | 12px                    | `text-xs`                |
| 11  | 标题字重 | `font-semibold`（600）        | 400                     | 移除 `font-semibold`     |
| 12  | 标题颜色 | 继承（白色）                  | `rgba(255,255,255,0.4)` | `text-f-text-quaternary` |
| 13  | 标签间距 | `gap-4 md:gap-x-6 md:gap-y-3` | 2px                     | `gap-0.5`                |

### 文件 2: `components/ModelTag.tsx`（共 1 处）

| #   | 属性     | 当前               | Figma 默认态 | Figma hover 态                                            | 改为                                             |
| --- | -------- | ------------------ | ------------ | --------------------------------------------------------- | ------------------------------------------------ |
| 14  | 标签样式 | 无背景/圆角/内边距 | 无背景       | `rgba(255,255,255,0.04)` 背景，12px 圆角，4px 12px 内边距 | 添加 `rounded-xl py-1 px-3 hover:bg-f-bg-layout` |

> 注：默认添加 padding 和圆角（保持布局稳定不抖动），仅 hover 时显示背景色。
> 文字颜色 `text-f-text-tertiary hover:text-f-primary` 已匹配无需修改。

### 无需修改（已匹配）

| 元素         | 当前值                                             | Figma 值                 |
| ------------ | -------------------------------------------------- | ------------------------ |
| 面板边框     | `border-f-border-secondary`                        | `rgba(255,255,255,0.04)` |
| 面板阴影     | `shadow-[0_20px_38px_0_rgba(0,0,0,0.48)]`          | 匹配                     |
| 卡片描述颜色 | `text-f-text-tertiary`（`rgba(255,255,255,0.65)`） | 匹配                     |
| 分割线       | `border-f-border-secondary`                        | 匹配                     |
| 标签文字颜色 | `text-f-text-tertiary hover:text-f-primary`        | 匹配                     |

---

## 涉及文件

- `web/src/pages/pollo.ai/_layout/Header/HeaderList/AiList/index.tsx` — 主组件（Video AI / Image AI 共用）
- `web/src/pages/pollo.ai/_layout/Header/HeaderList/components/ModelTag.tsx` — 模型标签样式

## 修改简报

⏺ 12 处修改全部完成：

AiList/index.tsx（11 处）：

- 面板：bg-f-bg-base + p-4 + rounded-3xl
- 卡片：text-f-text-secondary hover:text-f-primary + hover:bg-f-bg-layout + p-3 + rounded-xl
- 底部标题：text-xs text-f-text-quaternary（去掉 font-semibold）
- 标签间距：gap-0.5

ModelTag.tsx（1 处）：

- 添加 rounded-xl py-1 px-3 hover:bg-f-bg-layout

/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderList/AiList/index.tsx:40
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderList/AiList/index.tsx:54
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderList/AiList/index.tsx:80
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderList/components/ModelTag.tsx:31
