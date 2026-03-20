# MobileMenu 改造分析

## 设计稿概览

- 共 2 个 Figma 节点
- 节点 93228:25398 (Property 1=展开) → 移动端一级导航折叠状态（所有菜单项均未展开）
- 节点 93228:25510 (Property 1=折叠) → 移动端一级导航展开状态（Video AI 子菜单已展开）
- 去重结果：两者菜单列表区域结构一致，差异仅在 Video AI 的展开/折叠子项

### Figma 目标结构

```text
┌──────────────────────────────────────────┐
│ 顶部导航 (不在本次改造范围)                    │
├──────────────────────────────────────────┤
│ padding: 16px, gap: 8px (column)          │
│ divide-y divide-f-border                  │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ [icon 24x24] Home          p:8px     │ │ ← 一级菜单项 row, gap:8px
│ └──────────────────────────────────────┘ │
│ ──────── divide 分隔线 ──────────────── │
│ ┌──────────────────────────────────────┐ │
│ │ [icon 24x24] Apps          p:8px     │ │
│ └──────────────────────────────────────┘ │
│ ──────── divide 分隔线 ──────────────── │
│ ┌──────────────────────────────────────┐ │
│ │ [icon 24x24] Explore       p:8px     │ │
│ └──────────────────────────────────────┘ │
│ ──────── divide 分隔线 ──────────────── │
│ ┌──────────────────────────────────────┐ │
│ │ [icon] Video AI      [▼20x20] p:8px │ │ ← 可展开项
│ ├──────────────────────────────────────┤ │
│ │  gap:2px (展开后)                      │ │
│ │  ┌────────────────────────────────┐  │ │
│ │  │ Image to Video AI  p:8px 24px │  │ │ ← 子项 rounded-lg
│ │  └────────────────────────────────┘  │ │
│ │  ┌────────────────────────────────┐  │ │
│ │  │ Text to Video AI   p:8px 24px │  │ │
│ │  └────────────────────────────────┘  │ │
│ │  ...                                 │ │
│ └──────────────────────────────────────┘ │
│ ──────── divide 分隔线 ──────────────── │
│ ... 其他菜单项 ...                        │
│ ──────── divide 分隔线 ──────────────── │
│ ┌──────────────────────────────────────┐ │
│ │ [icon] Pricing             p:8px     │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ 底部入口 (不在本次改造范围)                    │
└──────────────────────────────────────────┘
```

## 保留项

- `useHeaderMenu({ isMobile: true })` 数据源全部保留
- `handleLinkClick` 逻辑（设置 TabType.Create）保留
- 路径变化关闭菜单逻辑 (`useEffect` 监听 `pathName`) 保留
- 所有埋点属性 (`data-button-name`, `data-track-sort`) 保留
- `MobileAiList` / `MobileGroupList` 子组件的展开/折叠交互逻辑保留
- `menuLayoutMobileName` ID 保留
- `InFlowLink` / `inflow` 逻辑保留
- `isBeta` 标签逻辑保留
- `isSignIn` 条件判断保留
- `isDarkColor` 条件渲染保留（Q3 确认）
- MobileAiList 底部 Model 标签区域保留（Q1 确认）
- MobileGroupList 底部 View More 链接保留（Q2 确认）

## 改造项列表

| # | 改造名称 | 涉及文件 | 差异类型 |
|---|----------|----------|----------|
| 1 | 根容器 padding 调整 | MobileMenu/index.tsx | 样式调整 |
| 2 | 菜单列表容器改用 divide-y 分隔线 | MobileMenu/index.tsx | 布局变动 |
| 3 | 一级菜单项 link 样式调整 | MobileMenu/index.tsx | 样式调整 |
| 4 | 可展开菜单标题行样式调整 | MobileAiList.tsx | 样式调整 |
| 5 | 子项列表去除图标、调整 padding | MobileAiList.tsx | 布局变动 |
| 6 | 子项列表容器间距调整 | MobileAiList.tsx | 样式调整 |
| 7 | 可展开菜单标题行样式调整 | MobileGroupList.tsx | 样式调整 |
| 8 | Assets 菜单图标修正 | menu.tsx | 样式调整 |
| 9 | Pricing 菜单图标修正 | menu.tsx | 样式调整 |

## 改造详情

### MobileMenu/index.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderMenu/_block/MobileMenu/index.tsx`

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderMenu/_block/MobileMenu/index.tsx

  // --- 改造 #1: 根容器 padding 调整 :52 ---
  // --- Figma: padding 16px 全方向 → 代码 px-6(24px) pb-10(40px) pt-4(16px) 不一致 ---
  <div
    id={menuLayoutMobileName}
    style={{
      top: `${DEFAULT_HEADER_HEIGHT}px`,
    }}
    className={cls`
-     border-f-border bg-f-other-5 absolute inset-0
-     z-50 block h-[calc(100vh-var(--header-container-height,52px))]
-     overflow-y-auto border-t px-6 pb-10 pt-4 xl:hidden
+     border-f-border bg-f-other-5 absolute inset-0
+     z-50 block h-[calc(100vh-var(--header-container-height,52px))]
+     overflow-y-auto border-t p-4 xl:hidden
    `}
  >

  // --- 改造 #2: 菜单列表容器改用 divide-y 分隔线 :65 ---
  // --- 参考 HeaderActions 的 divide-y 模式，由父容器统一管理分隔线 ---
  // --- 注意：每个菜单项需包裹为单一直接子元素，确保 divide-y 正确作用 ---
    <div
      onClick={...}
-     className='space-y-4 text-sm font-semibold'
+     className='divide-f-border flex flex-col divide-y text-sm font-semibold'
    >

  // --- 改造 #3: 一级菜单项 link 样式调整 :73 ---
  // --- Figma: 每行 padding 8px, gap 8px, 移除自身 border-b（由父级 divide-y 管理） ---
  // --- 保留 isDarkColor 条件渲染 ---
  {menuList.map((item) =>
    item.link ? (
      <React.Fragment key={item.name}>
        <Link
          rel={item.isNofollow ? 'nofollow' : ''}
          href={item.link}
          className={cls`
-             border-f-border
              hover:text-f-primary
-             flex items-center gap-1.5 border-b pb-4
-             before:size-6 ${item.mobileMenuIcon}
-           ${item.isDarkColor ? 'text-f-text-tertiary' : 'text-f-text-secondary'}
+             flex items-center gap-2 p-2
+             before:size-6 ${item.mobileMenuIcon}
+           ${item.isDarkColor ? 'text-f-text-tertiary' : 'text-f-text-secondary'}
          `}
          ...
        >
          {item.name}
        </Link>
      </React.Fragment>
    ) : item.videoAiList ? (
      ...                                             // MobileAiList 无需额外包裹
    ) : ...                                           // 其他分支同理
  )}
```

#### 逻辑改变清单

| 变更 | 原逻辑 | 新逻辑 | 原因 |
|------|--------|--------|------|
| 分隔线实现 | `border-b` 在每个菜单项自身 | 父容器 `divide-y divide-f-border` | 参考 HeaderActions 模式，由父容器统一管理分隔线，避免独立 div |
| padding 调整 | `gap-1.5` + `border-b pb-4` | `gap-2 p-2` | Figma: gap 8px, padding 8px |
| 间距管理 | `space-y-4` (16px) | `flex flex-col divide-y` (无额外间距) | Figma: 项间仅有分隔线无额外 gap，gap 8px 由列表容器外层 padding 实现 |

### MobileAiList.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/AiList/MobileAiList.tsx`

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/AiList/MobileAiList.tsx

  // --- 改造 #4: 可展开菜单标题行样式调整 :38 ---
  // --- Figma: 标题行 padding 8px, gap 8px, 移除自身 border-b（由父级 divide-y 管理） ---
  return (
-   <div className='border-f-border border-b'>
+   <div>
      <div
        onClick={() => setOpen(!open)}
        key={name}
        className={cls`
          flex items-center
-         justify-between ${!open ? 'pb-4' : ''}
+         justify-between gap-2 p-2
        `}
        data-button-name={dataButtonName}
        data-track-sort={dataTrackSort}
      >
        <p
          className={cls`
              hover:text-f-primary
              text-f-text-secondary
            ${
              mobileMenuIcon
                ? `
-                 items-center gap-1.5
+                 items-center gap-2
                  before:size-6 ${mobileMenuIcon}
                `
                : ''
            }
              flex
              cursor-pointer
          `}
        >
          {name}
        </p>
        ...
      </div>

  // --- 改造 #5: 子项列表去除图标、调整 padding :72 ---
  // --- 改造 #6: 子项容器间距 gap 2px ---
  // --- Figma: 子项无图标前缀, padding 8px 24px, border-radius 8px, 容器 gap 2px ---
      <div
-       className={cls`${open ? 'block' : 'hidden'} flex flex-col gap-4 py-4`}
+       className={cls`${open ? 'block' : 'hidden'} flex flex-col gap-0.5`}
      >
        {aiList.map((item) => {
          return (
            <div
              key={item.name}
-             className='relative flex flex-col gap-1.5 ps-6 text-sm'
+             className='flex flex-col gap-1.5 rounded-lg px-6 py-2 text-sm'
              data-button-name={item.dataButtonName}
              data-track-sort={item.sortIndex}
            >
              <div className='flex'>
                <InFlowLink
                  inFlow={item.inflow}
                  href={item.link}
-                 className={`flex items-center ps-[34px] font-semibold before:absolute before:start-[22px] before:size-6 ${item.icon} after:absolute after:inset-0 after:size-full`}
+                 className='flex items-center font-semibold text-f-text-secondary'
                  onClick={() => linkClick?.()}
                >
                  {item.name}
                </InFlowLink>
                ...                                   // isBeta StatusTag 保留不变
              </div>
            </div>
          )
        })}
        ...                                           // Model 标签区域保留不变 (Q1)
```

### MobileGroupList.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/GroupList/MobileGroupList.tsx`

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/GroupList/MobileGroupList.tsx

  // --- 改造 #7: 可展开菜单标题行样式调整 :28 ---
  // --- 与 MobileAiList 保持一致：移除自身 border-b，由父级 divide-y 管理 ---
  return (
-   <div key={name} className='border-f-border border-b'>
+   <div key={name}>
      <div
        onClick={() => setOpen(!open)}
        className={cls`
          flex items-center
-         justify-between ${!open ? 'pb-4' : ''}
+         justify-between gap-2 p-2
        `}
        data-button-name={dataButtonName}
        data-track-sort={dataTrackSort}
      >
        <p
          className={cls`
            hover:text-f-primary
            text-f-text-secondary
            cursor-pointer
              ${
                mobileMenuIcon
                  ? `
-                   items-center gap-1.5
+                   items-center gap-2
                    before:size-6 ${mobileMenuIcon}
                  `
                  : ''
              }
                flex
          `}
        >
        ...                                           // View More 链接保留不变 (Q2)
```

### menu.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderMenu/menu.tsx`

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderMenu/menu.tsx

  // --- 改造 #8: Assets 菜单图标修正 :953 ---
  // --- Figma 使用 cus-pol-projects 图标，代码使用 cus-pol-my-creation ---
  {
    name: t`Assets`,
    link: '/assets',
    hidden: !isMobile,
    shouldIndex: true,
    dataButtonName: ...,
-   mobileMenuIcon: 'before:i-cus--pol-my-creation',
+   mobileMenuIcon: 'before:i-cus--pol-projects',
  },
  ...
  // --- 改造 #9: Pricing 菜单图标修正 :971 ---
  // --- Figma 使用 cus-pol-crown-line 图标，代码使用 cus-pol-crown ---
  {
    name: t`Pricing`,
    link: '/pricing',
    shouldIndex: true,
    dataButtonName: ...,
-   mobileMenuIcon: 'before:i-cus--pol-crown',
+   mobileMenuIcon: 'before:i-cus--pol-crown-line',
    isDarkColor: true,
  },
```

## 样式映射参考

| Figma 颜色值 | figma-theme 变量 | Tailwind class |
|---|---|---|
| rgba(255,255,255,0.85) / #ffffffd9 | --f-text-secondary | text-f-text-secondary |
| rgba(255,255,255,0.65) / #ffffffa6 | --f-text-tertiary | text-f-text-tertiary |
| #0D0D12 | --f-other-5 | bg-f-other-5 |
| rgba(255,255,255,0.04) / #ffffff0a | --f-border | border-f-border / divide-f-border |
| #FF3466 | --f-primary | text-f-primary |

## Figma 关键布局参数参考

| 区域 | 属性 | Figma 值 | 对应 Tailwind |
|---|---|---|---|
| 根容器 | padding | 16px (all) | p-4 |
| 菜单列表 | 分隔线 | divide-y | divide-y divide-f-border |
| 一级菜单项行 | padding | 8px (all) | p-2 |
| 一级菜单项行 | gap | 8px | gap-2 |
| 一级菜单项图标 | size | 24x24 | before:size-6 (不变) |
| 展开箭头 | size | 20x20 | size-5 (不变) |
| 展开子项容器 | gap | 2px | gap-0.5 |
| 展开子项 | padding | 8px 24px | px-6 py-2 |
| 展开子项 | border-radius | 8px | rounded-lg |

## 已确认决策

| # | 决策 | 结论 |
|---|------|------|
| Q1 | MobileAiList 底部 Model 标签区域 | 保留 |
| Q2 | MobileGroupList 底部 View More 链接 | 保留 |
| Q3 | isDarkColor 字段及条件渲染 | 保留 isDarkColor 字段定义及 MobileMenu 中的条件渲染 |
| Q4 | 图标 i-cus--pol-projects / i-cus--pol-crown-line 可用性 | 先改，不可用时再拉取 |
