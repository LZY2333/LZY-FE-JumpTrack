# User 下拉菜单顶部改造分析

## 设计稿概览

- 共 2 个 Figma 节点
- 节点 93307:27743 → 下拉菜单收起状态（Language 折叠，显示 com-down 箭头）
- 节点 93307:28774 → 下拉菜单展开状态（Language 展开，显示语言列表 + com-up 箭头）
- 去重结果：两节点 Language 其上的结构完全一致，差异仅在 Language 展开/收起及其下方内容

**应用范围**：Language 其上两块内容（第一块新增用户信息卡、第二块 Workspace 挪入）+ 全局菜单项样式调整（高度、箭头位置、分割线），不含文本内容修改

### Figma 目标结构

```
┌─────────────────────────────────────────────┐  下拉菜单 w=360 p=16 gap=8
│  ┌────────────────────────────────────────┐  │  bg: #141419 rounded-12 border: rgba(255,255,255,0.04)
│  │ [avatar 32x32]  Tanka                 │  │  ← 第一块：用户信息卡（新增）
│  │                      tanka@gmail.com   │  │     bg: rgba(255,255,255,0.04) rounded-8 p=8 gap=2
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │  ← 第二块：Workspace 区块（从 Header 挪入）
│  │  Workspace                            │  │     bg: rgba(255,255,255,0.04) rounded-8 p=8 gap=2
│  │  Default Project 002            ▼     │  │     点击展开 Project 列表弹窗（保持不变）
│  └────────────────────────────────────────┘  │
│  ──────────── 分割线 ─────────────────────── │
│  🌐 Language                          ▼     │  ← 箭头 com-down，展开后 com-up
│  ──────────── 分割线 ─────────────────────── │
│  📁 Assets                                  │
│  ──────────── 分割线 ─────────────────────── │
│  💳 Billing                                  │
│  ──────────── 分割线 ─────────────────────── │
│  🎁 Refer a Friend 😀 🎉                    │
│  ──────────── 分割线 ─────────────────────── │
│  📧 Contact Us                     [copy]   │  ← copy 图标始终可见，无文字
│  ──────────── 分割线 ─────────────────────── │
│  👤 Profile                                  │
│  ──────────── 分割线 ─────────────────────── │
│  ⚙️ My Account                               │
│  ──────────── 分割线 ─────────────────────── │
│  🚪 Logout                                   │
└─────────────────────────────────────────────┘
```

## 保留项

- `HeaderActions` 中 `useGetAccountMenuList` 返回的菜单列表逻辑全部保留
- ~~`LanguageTab` PC 端 hover 弹侧面板逻辑保留不变~~ → 已改为点击展开内联列表（改造 #12）
- `FollowClaimCredits`、`WebMenuEntry` 等逻辑保留不变
- `UserInfo` 组件中 PC 端 DynamicPopover 的触发逻辑（click + contextMenu）保留不变
- `UserInfo` 组件中移动端菜单的逻辑保留不变
- `ProjectDropdown` / `ProjectName` / `ProjectItem` 组件内部逻辑保留不变（仅移动渲染位置）
- 所有埋点 tracker 逻辑保留不变
- `ContactUsMenuItem` 的 copy 功能逻辑保留（copy-to-clipboard、copied 状态、mailto 链接）

## 执行范围

- **执行项**：#1, #2, #3(随 #1/#2 一起), #4, #5, #7, #8, #9, #11, #12, #13, #14
- **移除项**：~~#6~~（内容 w-[360px] 自适应）、~~#10~~
- **追加项**：#12 Language 改为面板内点击展开、#13 修复 Pricing 双分割线、#14 Contact Us 图标靠右
- **PC 与移动端同步**：`HeaderActions`、`LanguageTab`、`ContactUsMenuItem` 为 PC/移动端共用组件，改动自动同步两端，无需额外移动端修改

### 移动端影响说明

| 组件                | PC/移动端关系        | 移动端是否需要额外修改 |
| ------------------- | -------------------- | ---------------------- |
| `HeaderActions`     | **同一组件**，PC 通过 `DynamicPopover` 弹出，移动端通过全屏菜单渲染 `DynamicHeaderActions` | 否，改动自动同步 |
| `LanguageTab`       | **同一组件**，PC/移动端统一为点击展开内联列表（#12 合并后） | 否，改动自动同步 |
| `ContactUsMenuItem` | **同一组件**，PC/移动端共用 | 否，改动自动同步 |
| `ProjectDropdown`   | 原 Header 中 PC 端 `sm:hidden md:block`，移入 `HeaderActions` 后两端均可见 | 否，但需关注 Q4（移动端原入口消失） |

## 改造项列表

| #   | 改造名称                                                   | 涉及文件                                                      | 差异类型 | 执行 |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------- | -------- | ---- |
| 1   | 新增用户信息卡片                                           | web/src/pages/pollo.ai/\_components/HeaderActions/index.tsx   | 新增元素 | ✅   |
| 2   | 挪入 Workspace/Project 区块                                | web/src/pages/pollo.ai/\_components/HeaderActions/index.tsx   | 布局变动 | ✅   |
| 3   | 下拉面板宽度调整与外层容器样式更新                         | web/src/pages/pollo.ai/\_components/HeaderActions/index.tsx   | 样式调整 | ✅   |
| 4   | HeaderActions 接收 handleOpenChange 透传到 ProjectDropdown | web/src/pages/pollo.ai/\_components/HeaderActions/index.tsx   | 条件渲染 | ✅   |
| 5   | Header 中移除独立的 ProjectDropdown                        | web/src/pages/pollo.ai/\_layout/Header/index.tsx              | 布局变动 | ✅   |
| 6   | ~~UserInfo Popover 面板容器宽度适配~~                      | ~~web/src/pages/pollo.ai/\_components/UserInfo/index.tsx~~    | ~~样式调整~~ | ❌ 移除（内容 w-[360px] 自适应） |
| 7   | 一级菜单项高度增加（padding 6px→8px）                      | web/src/pages/pollo.ai/\_components/HeaderActions/index.tsx   | 样式调整 | ✅   |
| 8   | Language 行箭头靠右 + 图标改为 com-down/com-up             | web/src/pages/pollo.ai/app/\_components/LanguageTab/index.tsx | 布局变动 | ✅   |
| 9   | 一级菜单项之间新增分割线                                   | web/src/pages/pollo.ai/\_components/HeaderActions/index.tsx   | 新增元素 | ✅   |
| 10  | ~~头像改为方形圆角~~                                       | ~~web/src/pages/pollo.ai/\_components/UserInfo/index.tsx~~    | ~~样式调整~~ | ❌ 移除 |
| 11  | Contact Us 复制图标始终显示，去除文字                       | web/src/pages/pollo.ai/app/\_components/ContactUsMenuItem/index.tsx | 样式调整 | ✅   |
| 12  | Language PC 端改为面板内点击展开内联列表                    | web/src/pages/pollo.ai/app/\_components/LanguageTab/index.tsx | 布局变动 | ✅   |
| 13  | 修复 Pricing 下双分割线（Credits md:hidden 泄露）          | web/src/pages/pollo.ai/app/\_hooks/menu.tsx + HeaderActions   | Bug 修复 | ✅   |
| 14  | Contact Us copy 图标靠右（Link 加 w-full）                  | web/src/pages/pollo.ai/app/\_components/ContactUsMenuItem/index.tsx | 样式调整 | ✅   |

## 改造详情

### web/src/pages/pollo.ai/\_components/HeaderActions/index.tsx

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/HeaderActions/index.tsx

  // --- 改造 #1: 新增 imports ---
+ import { useSiteSpecificContext } from '@/contexts/SiteSpecificContext'
+ import { UserAvatar } from '../UserInfo'
+ import ProjectDropdown from '../../_layout/Header/ProjectDropdown'

  // --- 改造 #1: 新增 user 数据依赖 ---
  export default function HeaderActions(props: IHeaderActionsProps) {
    const { className, itemClassName, locales, handleOpenChange } = props
+   const { user } = useSiteSpecificContext()                           // L22 获取用户信息

    ...

  // --- 改造 #7: 一级菜单项高度增加 ---
  const itemCls = cls`
    hover:text-f-primary hover:bg-f-bg-layout text-f-text flex items-center gap-x-2
-   space-x-[2px] rounded px-2 py-2.5 text-base font-semibold transition-all hover:cursor-pointer md:py-1.5 md:text-sm
+   space-x-[2px] rounded px-2 py-2.5 text-base font-semibold transition-all hover:cursor-pointer md:py-2 md:text-sm
  `                                                                     // L44 md:py-1.5(6px) → md:py-2(8px)

    ...

  // --- 改造 #3: 外层容器从 <ul> 改为 <div>，宽度 360px + padding 16px ---
    return (
-     <ul
-       id={profileMenuClassName}
-       className={tw`min-w-[140px] gap-y-2 overflow-hidden  p-2${className}`}
+     <div
+       id={profileMenuClassName}
+       className={tw`overflow-hidden p-4 md:w-[360px] ${className}`}    // L71 移动端自适应，PC端 360px
        data-widget-name={
          trackComponentName.framework_widget.value.user_center.name
        }
-       onClick={handleClick}
      >

  // --- 改造 #1: 用户信息卡片 ---
+       <div className='bg-f-bg-layout flex flex-col gap-0.5 rounded-lg p-2'>
+         <div className='flex items-center gap-2 p-2'>
+           <UserAvatar className='!size-8' />                             // 32x32
+           <div className='flex flex-col'>
+             <span className='text-f-text text-xs font-semibold leading-4'>
+               {user.userName}
+             </span>
+             <span className='text-f-text-quaternary text-xs font-normal leading-4'>
+               {user.userEmail}
+             </span>
+           </div>
+         </div>
+       </div>

  // --- 改造 #2: Workspace 区块 ---
+       <div className='bg-f-bg-layout mt-2 flex flex-col gap-0.5 rounded-lg p-2'>
+         <div className='px-2 py-1'>
+           <span className='text-f-text-quaternary text-xs font-normal leading-4'>
+             Workspace
+           </span>
+         </div>
+         <ProjectDropdown />
+       </div>

  // --- 改造 #9: 菜单列表 + 分割线 ---
+       <div className='border-f-border-secondary my-2 border-t' />    // Workspace 与菜单列表之间的分割线

+       <ul
+         className={tw`flex flex-col gap-2 overflow-hidden p-0`}
+         onClick={handleClick}
+       >
-       {tabs.map((v) => {
-         return (
-           <li key={v.title} data-button-name={v.buttonName}>
+       {tabs.map((v, index) => {
+         return (
+           <React.Fragment key={v.title}>
+             {index > 0 && (
+               <li className='border-f-border-secondary border-t' />  // 分割线：无水平边距，撑满容器宽度
+             )}
+             <li data-button-name={v.buttonName}>
                ...                                                    // 菜单项渲染逻辑不变
-           </li>
-         )
-       })}
-       <WebMenuEntry />
+             </li>
+           </React.Fragment>
+         )
+       })}
+       <li className='border-f-border-secondary border-t' />
+       <WebMenuEntry />
+       <li className='border-f-border-secondary border-t' />
        <li
          className={tw`${itemCls} ${itemClassName}`}
          ...                                                          // Logout 逻辑不变
        >
          <span>{t`Logout`}</span>
        </li>
-     </ul>
+       </ul>
+     </div>
    )
```

#### 逻辑改变清单

| 变更                      | 原逻辑                         | 新逻辑                                         | 原因                                                               |
| ------------------------- | ------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------ |
| 外层容器 `<ul>` → `<div>` | 整个下拉面板是一个 `<ul>` 列表 | 外层改为 `<div>`，菜单列表部分仍用 `<ul>` 包裹 | 新增的用户卡和 Workspace 不是列表项                                |
| 宽度变更                  | `min-w-[140px]` + `p-2`       | `md:w-[360px]` + `p-4`                         | PC 端 360px（Figma），移动端自适应父容器宽度                       |
| 新增 user 数据依赖        | 无                             | 引入 `useSiteSpecificContext` 获取 user 信息   | 用户信息卡片需要动态展示用户名和邮箱                               |
| ProjectDropdown 位置      | Header 中独立渲染              | 移入 HeaderActions 下拉面板内部                | Figma 设计稿将 Workspace 归入用户下拉                              |
| 一级菜单项 padding        | `md:py-1.5`（6px）            | `md:py-2`（8px）                               | Figma 一级 item padding 为 8px，当前为 6px（+4px 总高度）          |
| 菜单项间距方式             | `gap-y-2` 间距，无分割线      | `flex flex-col gap-2` + 每项之间插入 `border-f-border-secondary` 分割线（无水平边距，撑满容器宽度） | Figma：分割线撑满容器宽度（无缩进），item 内部 `px-2`(8px) 提供文字缩进，容器 gap 8px |

### web/src/pages/pollo.ai/app/\_components/LanguageTab/index.tsx

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/_components/LanguageTab/index.tsx

  // --- 改造 #12: PC/移动端统一为点击展开内联列表 ---
  // 移除 PC 端 hover 弹侧面板实现（group + peer + absolute positioned <ul>）
  // 移除 baseItemCls 变量
  // 移除 PC/移动端分别实现（md:flex / md:hidden），统一为单一实现

  return (
-   <>
-     {/* PC端实现 - 悬浮弹框 (md:flex) */}
-     <div className={cls`${className} group hidden md:flex`}>
-       <div className='peer flex items-center justify-between gap-1'>
-         <span>{title}</span>
-         <span className='ltr:i-com--right rtl:i-com--left block size-4' />
-       </div>
-       <ul className='... absolute ... group-hover:scale-100 ...'>
-         {/* grid 布局语言列表 */}
-       </ul>
-     </div>
-     {/* 移动端实现 - 展开列表 (md:hidden) */}
-     <div className={`${baseItemCls} flex flex-col md:hidden ...`}>
-       ...
-     </div>
-   </>

+   <div className='flex flex-col'>
+     <div
+       className={cls`${className} w-full cursor-pointer justify-between`}  // className = itemCls，提供 flex/padding/hover 等基础样式
+       onClick={() => setIsOpen(!isOpen)}
+     >
+       <span>{title}</span>
+       <span className={cls`block size-5 transition-transform duration-200 ${isOpen ? 'i-com--up' : 'i-com--down'}`} />
+     </div>
+     {isOpen && (
+       <ul className='flex w-full flex-col gap-0.5 pt-1'>
+         {localesList.map((e) => (
+           <li key={e.abbr} ...>
+             <Link
+               className='text-f-text-secondary hover:text-f-primary hover:bg-f-bg-layout block rounded px-6 py-2 text-sm font-normal'
+               ...                                                          // px-6(24px) py-2(8px) 对齐 Figma layout_1KVL5L
+             >
+               {e.language}
+             </Link>
+           </li>
+         ))}
+       </ul>
+     )}
+   </div>
  )
```

> PC 端不再使用 hover 弹出侧面板，改为与移动端统一的点击展开内联列表。语言子项样式：`px-6 py-2 text-sm`（Figma: padding 8px 24px, 14px font, 400 weight）。箭头折叠 `com-down`，展开 `com-up`。

### web/src/pages/pollo.ai/app/\_components/ContactUsMenuItem/index.tsx

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/_components/ContactUsMenuItem/index.tsx

  // --- 改造 #11: 复制图标始终显示，去除文字 ---
  export const ContactUsMenuItem = ({ className }: ContactUsMenuItemProps) => {
    const { t } = useLingui()
    const [copied, setCopied] = useState(false)
-   const [isHovered, setIsHovered] = useState(false)                      // L14 移除 hover 状态
-   const screen = useCurrentScreen()                                      // L15 移除屏幕判断
-   const isMobile = useMemo(...)                                          // L16 移除移动端判断

    ...

-   const shouldShowCopyButton = isMobile || isHovered || copied           // L36 移除条件判断

    return (
      <div
        className={className}
-       onMouseEnter={() => setIsHovered(true)}                            // 移除 hover 监听
-       onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={`mailto:${supportEmail}`}
-         className='text-f-text hover:text-f-primary flex items-center justify-between'
+         className='text-f-text hover:text-f-primary flex w-full items-center justify-between'
+                                                                          // 改造 #14: 加 w-full 使 justify-between 生效，copy 图标靠右
        >
          <span className='text-sm'>{t`Contact Us`}</span>
-         <div
-           className={cls`
-             ml-2 flex min-h-[22px] min-w-[52px] items-center justify-end rounded-md p-0.5
-             transition-opacity duration-150
-             ${shouldShowCopyButton ? 'opacity-100' : 'pointer-events-none opacity-0'}
-           `}
-           onClick={handleCopyClick}
-         >
-           <div className='hover:bg-f-bg-hover flex items-center justify-center gap-x-1 rounded-md'>
-             <span className={cls`text-f-text-tertiary size-4 ${copied ? 'i-cus--pol-select' : 'i-cus--pol-unselect cursor-pointer'}`} />
-             <span className='text-f-text-tertiary text-xs'>
-               {copied ? t`Copied` : t`Copy`}
-             </span>
-           </div>
-         </div>
+         <span                                                            // 始终可见的 copy 图标，无文字
+           className={cls`
+             size-5 cursor-pointer
+             ${copied ? 'i-cus--pol-select text-f-text-tertiary' : 'i-cus--pol-copy-solid text-f-text-tertiary'}
+           `}
+           onClick={handleCopyClick}
+         />
        </Link>
      </div>
    )
  }
```

### web/src/pages/pollo.ai/app/\_hooks/menu.tsx + HeaderActions 联动

```diff
// --- 改造 #13: 修复 Pricing 下双分割线 ---
// 原因：Credits 项用 CSS md:hidden 桌面端隐藏，但 <li> 和分割线仍占位，导致双分割线

// menu.tsx — Credits 项添加 className
  {
    title: t`Credits`,
    hidden: !canShowClaimCredits,
+   className: 'md:hidden',                                               // 标记桌面端隐藏
    render: (className) => {
      return (
        <FollowClaimCredits className={`${className} md:hidden`} showText />
      )
    },
  },

// HeaderActions/index.tsx — divider 和 wrapper <li> 应用 v.className
  {tabs.map((v, index) => {
    return (
      <React.Fragment key={v.title}>
        {index > 0 && (
-         <li className='border-f-border-secondary border-t' />
+         <li className={cls`border-f-border-secondary border-t ${v.className}`} />
        )}
-       <li data-button-name={v.buttonName}>
+       <li className={v.className} data-button-name={v.buttonName}>
```

> Credits 的 `md:hidden` 现在同步应用到分割线和 wrapper `<li>` 上，桌面端三者一起隐藏，不再产生双分割线。

### web/src/pages/pollo.ai/\_layout/Header/index.tsx

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/index.tsx

  // --- 改造 #5: Header 中移除独立的 ProjectDropdown ---
- import ProjectDropdown from './ProjectDropdown'                          // L38 移除 import
  ...

            {showLoginUserInfo ? (
              <>
-               {/* 全局 projectId 切换功能，放在积分左侧 */}
-               {isSignIn && (
-                 <ProjectDropdown
-                   className={cls`
-                     ${isAdPromotionPage ? 'relative z-[1]' : ''}
-                   `}
-                 />
-               )}

                {isSignIn && <History />}
                ...
```

## 现有组件复用

- `UserAvatar` — 来自 `UserInfo/index.tsx`，头像组件，通过 `className='!size-8'` 覆盖为 32×32
- `ProjectDropdown` — 来自 `Header/ProjectDropdown/index.tsx`，完整复用其内部逻辑，仅改变渲染位置
- `useSiteSpecificContext` — 获取 `user.userName` / `user.userEmail` 展示用户信息

## 样式映射参考

| Figma 颜色值                                 | figma-theme 变量       | Tailwind class              |
| -------------------------------------------- | ---------------------- | --------------------------- |
| `#141419` (面板背景)                         | `--f-bg-base`          | `bg-f-bg-base`              |
| `rgba(255,255,255,0.04)` (卡片背景)          | `--f-bg-layout`        | `bg-f-bg-layout`            |
| `rgba(255,255,255,0.04)` (描边/分割线)       | `--f-border-secondary` | `border-f-border-secondary` |
| `#FF7D05` (头像背景)                         | `--f-orange-6`         | `bg-f-orange-6`（已有）     |
| `#FFFFFF` (用户名文字)                       | `--f-text`             | `text-f-text`               |
| `rgba(255,255,255,0.4)` (邮箱/Workspace标签) | `--f-text-quaternary`  | `text-f-text-quaternary`    |
| `rgba(255,255,255,0.85)` (菜单项文字)        | `--f-text-secondary`   | `text-f-text-secondary`     |

## 数据字段映射

| Figma 展示                   | 数据来源                                             |
| ---------------------------- | ---------------------------------------------------- |
| 用户头像 "T"                 | `UserAvatar` 组件（内部使用 `user.userName` 首字母） |
| 用户名 "Tanka"               | `useSiteSpecificContext().user.userName`             |
| 邮箱 "tanka@gmail.com"       | `useSiteSpecificContext().user.userEmail`            |
| Workspace 标签               | 硬编码 "Workspace"（Figma 固定文本）                 |
| 项目名 "Default Project 002" | `ProjectDropdown` 内部 `currentProject.projectName`  |

## 冲突与疑问

| #   | 类型 | 描述                                                                                                                                                                                                           | 建议处理方式                                                                                           |
| --- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Q1  | 存疑 | `useSiteSpecificContext().user` 是否包含 `userEmail` 字段？当前代码中 `UserAvatar` 只使用了 `userName` 和 `userImage`，未确认 `userEmail` 是否可用                                                             | 需确认 `useSiteSpecificContext` 返回的 user 对象是否有 email 字段；如果没有，可能需要从 session 中获取 |
| Q2  | 存疑 | `ProjectDropdown` 当前在 Header 中作为独立组件渲染，移入下拉面板后，其内部的 `DynamicDropdown` 会嵌套在 `DynamicPopover` 内部，需确认二级弹出层的 z-index 和定位是否正常                                       | 建议实际移入后测试弹出层表现；可能需要调整 `getPopupContainer`                                         |
| Q3  | 存疑 | ProjectDropdown 当前宽度在桌面端为 `w-[148px]`（带 border），移入 360px 宽的下拉面板后，ProjectName 触发器的样式（宽度、背景、边框）是否需要适配新容器？用户说"只先挪过来不对组件进行修改"，但视觉上可能有差异 | 用户已明确不修改，先保持原样挪入，后续再改                                                             |
| Q4  | 存疑 | Header 中 `ProjectDropdown` 移除后，移动端（`sm:hidden`）的 Project 图标入口也会消失，移动端全屏菜单（`isMobileUserMenuOpen`）中是否也需要展示 Workspace 区块？                                                | 需确认移动端的 Project 入口是否在用户下拉的移动端全屏菜单中也需要渲染                                  |
| Q5  | 存疑 | "Workspace" 标签文本是否需要走国际化 `<Trans>Workspace</Trans>`？Figma 中为固定英文，但作为 UI 文案通常需要翻译                                                                                                | 建议使用 `<Trans>` 包裹，但用户说"不应用其文本内容修改"，待确认                                        |
