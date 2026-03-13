# ProjectDropdown 改造分析

## 设计稿概览

- 共 4 个 Figma 节点
- 节点 93614:49156 → User 下拉菜单，Project 区域默认态
- 节点 93614:49375 → User 下拉菜单，Project 区域 hover 态（name 行增加背景 + 圆角）
- 节点 93614:47583 → ProjectDropdown 弹出面板（含 +Project 按钮 + 项目列表 4 种状态）
- 节点 93614:49593 → User 下拉菜单完整面板（定位参考）
- 去重结果：49156 与 49375 仅 Project name 行的背景/圆角有差异，其余完全一致

**应用范围**：样式修改 + 面板定位 + 移动端/PC 端渲染模式拆分

### Figma 目标结构

**ProjectName 触发器（在 User 下拉面板内）：**

```
┌─────────────────────────────────────────────┐  User 下拉面板 w=360
│  [用户信息卡片]                               │
│  ┌────────────────────────────────────────┐  │  Workspace 区块
│  │  Workspace                            │  │  bg: f-bg-layout, r=8, p=8
│  │  ┌──────────────────────────────────┐ │  │  ← ProjectName 触发行（PC/移动统一）
│  │  │ Default Project 002          ▼   │ │  │    默认: 无bg, p=8
│  │  └──────────────────────────────────┘ │  │    hover: bg=f-bg-hover, r=8
│  └────────────────────────────────────────┘  │
│  ...                                         │
└─────────────────────────────────────────────┘
```

**ProjectDropdown 面板：**

```
PC 端: DynamicPopover placement='leftTop' 弹出在 User 下拉面板左侧
移动端: LanguageTab 式 max-h 内联展开（无弹出层）

┌────────────────────────────┐  面板 p=16 gap=12 r=12 (PC) / 无容器装饰 (移动端)
│  [+] Project               │  ← +Project 按钮 (灰色，非红色)
│  ───────────────────────── │     bg=f-bg-layout, text=f-text-tertiary
│  Project 001               │  ← 默认态: text=f-text-quaternary
│  Project 002               │  ← 选中态: text=f-primary, bg=f-bg-layout
│  Project 003               │  ← 默认态
│  Project 004   [✏️][🗑️]    │  ← hover态: text=f-text-secondary, bg=f-bg-hover
└────────────────────────────┘
```

## 保留项

- `ProjectDropdown/index.tsx` 所有业务逻辑（CRUD、排序、切换）保留不变
- `ProjectName.tsx` 所有状态管理、事件处理逻辑保留不变
- `ProjectItem.tsx` 编辑模式（输入框、取消/确认按钮）逻辑保留不变
- `ProjectItem.tsx` 中 `renderOptionsMenu` 的 hover 显示/隐藏逻辑保留不变
- 所有埋点 tracker 逻辑保留不变
- `mobileOpen`/`pcOpen` 两套 open 状态分别管理移动端内联展开与 PC 端 DynamicPopover（详见改造 #9）
- `CustomModal` 删除确认弹窗逻辑保留

## 改造项列表

| #   | 改造名称                                    | 涉及文件        | 差异类型       |
| --- | ------------------------------------------- | --------------- | -------------- |
| 1   | +Project 按钮颜色从红色改为灰色，移除 border | ProjectName.tsx | 样式调整       |
| 2   | 项目列表项 hover 态增加文字变白             | ProjectItem.tsx | 样式调整       |
| 3   | 面板容器样式更新（bg/border/padding/gap）   | ProjectName.tsx | 样式调整       |
| 4   | 触发行样式统一（去 border/固定宽度/默认 bg）| ProjectName.tsx | 样式调整       |
| 5   | 项目列表容器间距调整                        | ProjectName.tsx | 样式调整       |
| 6   | PC 端面板定位：DynamicDropdown → DynamicPopover leftTop | ProjectName.tsx | 组件 + 样式 |
| 7   | 移动端去图标触发器，LanguageTab 内联展开    | ProjectName.tsx | 结构 + 样式    |
| 8   | renderDropdownContent 参数化（内联/弹出）   | ProjectName.tsx | 结构调整       |
| 9   | 两套 open 状态替代 useScreenIdle            | ProjectName.tsx | 逻辑调整       |

## 改造详情

### ProjectName.tsx

#### 改造 #1: +Project 按钮灰色化 + 移除 border

todo.md: "顶部 +Project 改成灰色, hover 态字体变白"
Figma 47583 Frame 40475: bg=rgba(255,255,255,0.04), text=rgba(255,255,255,0.65)

```diff
          <div
            className={cls`
-             bg-f-primary-style-2 border-f-primary-style-2 text-f-primary
-             box-border flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border
+             bg-f-bg-layout text-f-text-tertiary hover:text-f-text
+             box-border flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg
              px-2.5 py-3.5 text-sm font-semibold leading-5 transition-colors
            `}
            onClick={handleCreateProject}
          >
```

#### 改造 #3: 面板容器样式更新

Figma 47583: p=16, gap=12, r=12, bg=#141419
面板宽度不变（保留 `w-[200px] sm:w-[240px]`，PC 端由 `overlayClassName` 约束）

```diff
        <div
          ...
          className={cls`
-           bg-f-bg-container border-f-other-4 mt-1 flex w-[200px] min-w-0 flex-col overflow-x-hidden rounded-xl
-           border p-2 sm:w-[240px]
+           bg-f-bg-base border-f-border mt-1 flex w-[200px] min-w-0 flex-col overflow-x-hidden rounded-xl
+           border p-4 gap-3 sm:w-[240px]
          `}
        >
```

#### 改造 #5: 项目列表容器间距调整

Figma 47583 Frame 155734: gap=4

```diff
          <div
            className={cls`
-             scrollbar max-h-[300px] overflow-y-auto overflow-x-hidden pr-0.5
-             ${!newProjectButtonDisabled || isCreatingNewProject ? 'mt-2' : 'mt-0'}
+             scrollbar flex max-h-[300px] flex-col gap-1 overflow-y-auto overflow-x-hidden pr-0.5
            `}
          >
```

#### 改造 #8: renderDropdownContent 参数化

将面板容器样式拆分为内联模式和弹出模式：

```diff
- const renderDropdownContent = useMemoizedFn(() => {
+ const renderDropdownContent = useMemoizedFn((isInline?: boolean) => {
    return (
      <div
        ...
        className={cls`
-         bg-f-bg-container border-f-other-4 mt-1 flex w-[200px] min-w-0 flex-col overflow-x-hidden rounded-xl
-         border p-2 sm:w-[240px]
+         flex flex-col
+         ${
+           isInline
+             ? 'w-full gap-1 pt-1'
+             : 'mt-1 w-[200px] min-w-0 gap-3 overflow-x-hidden rounded-xl border border-f-border bg-f-bg-base p-4 sm:w-[240px]'
+         }
        `}
      >
```

> 注：改造 #3 和 #8 作用于同一处 className。#3 描述的是 PC 弹出面板的样式变更，#8 在此基础上增加了 `isInline` 条件分支。最终代码以 #8 为准。

#### 改造 #4 + #6 + #7 + #9: 触发行统一 + PC DynamicPopover + 移动端内联展开 + 两套 open 状态

Figma 49156 默认态: 无 bg, p=8, text=f-text-secondary, 箭头=f-text-quaternary
Figma 49375 hover 态: bg=f-bg-hover, r=8
PC 定位: antd Dropdown 不支持 `leftTop`，改用 DynamicPopover（antd Popover 支持 12 方向）
移动端: 移除图标触发器，与 PC 统一为文字+箭头，CSS `md:hidden`/`hidden md:block` 切换渲染

**为什么使用两套 open 状态而非 `useScreenIdle` + 单一 open：**

> `rc-trigger`（antd Popover/Dropdown 底层）在 `open=true` 时会在 `window` 上注册全局 `mousedown` 监听器（`useWinClick.js`），
> 用于检测"点击在弹出层外部则关闭"。该监听器**不受 CSS `display:none` 影响**——即使 DynamicPopover 通过 CSS 隐藏了，
> 只要 `open=true` 且 `popupEle` 存在，`mousedown` 就会触发 `onOpenChange(false)`。
>
> 如果移动端和 PC 端共用一个 `open` 状态：
> 1. 移动端用户点击触发器 → `setOpen(true)` → 内联展开正常显示
> 2. 同时 DynamicPopover（CSS 隐藏）也收到 `open=true` → `rc-trigger` 注册全局 `mousedown`
> 3. 用户点击内联面板中的 +Project 按钮 → 该点击被 `rc-trigger` 判定为"弹出层外部点击" → 调用 `onOpenChange(false)` → 内联面板意外收起
>
> 拆分为 `mobileOpen` + `pcOpen` 后：
> - 移动端只操作 `mobileOpen`，`pcOpen` 恒为 `false` → DynamicPopover 不创建 `popupEle` → `useWinClick` 不注册监听器 → **零干扰**
> - PC 端只操作 `pcOpen`，`mobileOpen` 恒为 `false` → 移动端内联块折叠 → 互不影响
> - 无需 JS 断点检测（`useScreenIdle`），纯 CSS 响应式，与项目其他组件模式一致

```diff
- import DynamicDropdown from '@/components/antd/DynamicDropdown'
- import { useScreenIdle } from '@/hooks/screen'
+ import DynamicPopover from '@/components/antd/DynamicPopover'
```

**状态声明：单一 open → 两套 open + closeAll：**

```diff
- const [open, setOpen] = useState(false)
+ const [mobileOpen, setMobileOpen] = useState(false)
+ const [pcOpen, setPcOpen] = useState(false)
+ const closeAll = useMemoizedFn(() => {
+   setMobileOpen(false)
+   setPcOpen(false)
+ })
```

**useEffect 清理条件：**

```diff
  useEffect(() => {
-   if (!open) {
+   if (!mobileOpen && !pcOpen) {
      setEditingProjectId(null)
      setIsCreatingNewProject(false)
      setNewProjectName('')
    }
- }, [open])
+ }, [mobileOpen, pcOpen])
```

**CRUD 关闭操作（handleProjectClick 中 2 处 `setOpen(false)`）：**

```diff
- setOpen(false)
+ closeAll()
```

**移除 useScreenIdle：**

```diff
- const { matched: isSmallScreen } = useScreenIdle('sm')
```

**新增 renderTrigger 函数（替代原有移动端图标 + 桌面端文字两套触发器）：**

```tsx
  const renderTrigger = useMemoizedFn((isOpen: boolean, onClick?: () => void) => (
    <div
      className={cls`
        hover:bg-f-bg-hover group flex h-9 w-full cursor-pointer items-center
        gap-2 rounded-lg p-2 transition-colors
        ${isOpen ? 'bg-f-bg-hover' : ''}
      `}
      {...(onClick ? { onClick } : {})}
    >
      <span
        className={cls`
          text-f-text-secondary flex-1 truncate text-sm font-normal leading-5 tracking-normal
        `}
      >
        {projectName || DEFAULT_PROJECT_NAME}
      </span>
      <CssIcon
        className={cls`
          i-com--down size-5 text-f-text-quaternary
          transition-transform duration-200 ${isOpen ? 'rotate-180 text-f-text-secondary' : ''}
        `}
      />
    </div>
  ))
```

**替换原 return 块（移除 DynamicDropdown + 移动端图标 + 桌面端触发器）：**

```diff
  return (
    <>
      {contextHolder}
      <div className={className}>
        {match(initialized)
          .with(false, () => (
-           <Skeleton.Node active className='!h-8 !w-8 sm:!w-[148px]' />
+           <Skeleton.Node active className='!h-9 !w-full' />
          ))
-         .with(true, () => (
-           <DynamicDropdown
-             popupRender={renderDropdownContent}
-             placement={isSmallScreen ? 'bottomLeft' : 'bottom'}
-             trigger={['click']}
-             overlayClassName={cls`...`}
-             open={open}
-             onOpenChange={setOpen}
-           >
-             <div className='flex items-center'>
-               {/* 移动端：只显示 icon */}
-               <div className={cls`... sm:hidden`}>
-                 <CssIcon className='i-cus--pol-projects ...' />
-               </div>
-               {/* 桌面端：文字 + 下拉箭头 */}
-               <div className={cls`... hidden ... sm:flex ...`}>
-                 <span>...</span>
-                 <CssIcon className='i-com--up ...' />
-               </div>
-             </div>
-           </DynamicDropdown>
-         ))
+         .with(true, () => (
+           <>
+             {/* 移动端：内联展开，md 以下可见 */}
+             <div className='flex flex-col md:hidden'>
+               {renderTrigger(mobileOpen, () => setMobileOpen(!mobileOpen))}
+               <div
+                 className={cls`
+                   overflow-hidden transition-all duration-300
+                   ${mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
+                 `}
+               >
+                 {renderDropdownContent(true)}
+               </div>
+             </div>
+
+             {/* PC 端：DynamicPopover 弹出，md 及以上可见 */}
+             <div className='hidden md:block'>
+               <DynamicPopover
+                 content={renderDropdownContent()}
+                 placement='leftTop'
+                 trigger='click'
+                 arrow={false}
+                 overlayInnerStyle={{ padding: 0, background: 'transparent', boxShadow: 'none' }}
+                 overlayClassName={cls`!z-[200]`}
+                 open={pcOpen}
+                 onOpenChange={setPcOpen}
+               >
+                 {renderTrigger(pcOpen)}
+               </DynamicPopover>
+             </div>
+           </>
+         ))
          .exhaustive()}
      </div>
    </>
  )
```

### ProjectItem.tsx

#### 改造 #2: 项目列表项 hover 态增加文字变白

todo.md: "下面的 project item hover 态字体变白且有背景色（优先级低于选中态）"
Figma 47583 Project 004 hover: text=rgba(255,255,255,0.85)=f-text-secondary

```diff
      <div
        ref={itemRef}
        className={cls`
          group box-border flex h-9 w-full min-w-0 items-center gap-2 overflow-hidden rounded-lg
          px-3 py-2 text-sm font-normal leading-5 transition-colors
          ${
            isEditing
              ? 'bg-f-bg-container text-f-primary'
              : isSelected
                ? 'bg-f-bg-layout text-f-primary'
-               : 'text-f-text-quaternary hover:bg-f-bg-hover'
+               : 'text-f-text-quaternary hover:bg-f-bg-hover hover:text-f-text-secondary'
          }
          ${index > 0 ? 'mt-1' : ''}
        `}
```

## 逻辑变更总览

| 变更                   | 原逻辑                                            | 新逻辑                                             | 原因                                              |
| ---------------------- | ------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| +Project 按钮颜色      | `bg-f-primary-style-2 text-f-primary`（红色主题） | `bg-f-bg-layout text-f-text-tertiary`（灰色主题）  | Figma 47583 + todo.md "顶部 +Project 改成灰色"    |
| +Project hover         | 无 hover 效果                                     | `hover:text-f-text`（字体变白）                    | todo.md "hover 态字体变白"                         |
| +Project border        | `border-f-primary-style-2 border`                 | 移除 border                                        | Figma 47583 底色与容器近似，边框不可见             |
| 面板 padding           | `p-2`（8px）                                      | `p-4`（16px）                                      | Figma 47583 padding=16                             |
| 面板背景               | `bg-f-bg-container`                               | `bg-f-bg-base`                                     | Figma 47583 fill=#141419 = bg-base                 |
| 面板边框               | `border-f-other-4`                                | `border-f-border`                                  | Figma 47583 stroke                                 |
| 面板宽度               | `w-[200px] sm:w-[240px]`                          | 不变（PC 端保留在 renderDropdownContent 非内联分支中；移动端内联 `w-full`） | 决议: 保留原宽度 |
| 列表间距               | 条件 `mt-2`/`mt-0`                                | `flex flex-col gap-1`                              | Figma 47583 gap=4px                                |
| 触发行 border          | `border-f-border-secondary`                       | 移除                                               | Figma 49156 无边框                                 |
| 触发行宽度             | `w-[148px]` 固定                                  | `w-full` 撑满                                      | Figma 49156 撑满父容器                             |
| 触发行背景             | `bg-f-bg-layout`（始终有底色）                    | 无底色，hover 才 `bg-f-bg-hover`                   | Figma 49156 默认无 bg，49375 hover 才有            |
| 触发行文字色           | `text-f-text-tertiary`（0.65）                    | `text-f-text-secondary`（0.85）                    | Figma 49156 text=rgba(255,255,255,0.85)            |
| 箭头图标               | `i-com--up` + 关闭态 `rotate-180`                 | `i-com--down` + open 态 `rotate-180`               | Figma 49156 使用 com-down；默认朝下，展开态朝上    |
| 箭头颜色               | `text-f-text-tertiary`                            | `text-f-text-quaternary`，open 态 `text-f-text-secondary` | Figma 49156 fill=rgba(255,255,255,0.40) |
| ProjectItem hover 文字 | 无 hover 文字变化                                 | `hover:text-f-text-secondary`                      | todo.md "hover 态字体变白"                         |
| 项目默认态 bg          | 无默认 bg                                         | 不变（无默认 bg，hover 才加）                      | 决议: Figma 可能为 hover 截图                      |
| 弹出组件               | `DynamicDropdown` placement='bottom'              | `DynamicPopover` placement='leftTop' arrow={false} | antd Dropdown 不支持 leftTop，Popover 支持         |
| 移动端触发器           | `sm:hidden` 图标 `i-cus--pol-projects`            | 与 PC 统一为 renderTrigger（文字+箭头）            | 决议: 移动端与 PC 统一样式代码                     |
| 移动端展开方式         | `DynamicDropdown` 弹出                            | LanguageTab 式 `max-h` 过渡内联展开               | 决议: 不使用弹出层，内联展开                       |
| open 状态              | 单一 `[open, setOpen]`                            | `[mobileOpen, setMobileOpen]` + `[pcOpen, setPcOpen]` + `closeAll()` | rc-trigger 全局 mousedown 干扰（详见改造 #9） |
| 屏幕检测               | `useScreenIdle('sm')` → `isSmallScreen`           | **移除**，改用 CSS `md:hidden`/`hidden md:block`   | 两套 open 状态后无需 JS 断点检测                   |
| 移动端/PC 端切换       | 两套触发器在同一 DynamicDropdown 内               | 拆为独立 DOM 块，CSS 响应式显隐                    | 与项目其他组件（UserInfo）模式一致                  |
| renderDropdownContent  | 无参数，固定面板样式                              | `(isInline?: boolean)` 参数化：内联 `w-full gap-1 pt-1`，弹出保留原宽度+新样式 | 移动端内联无需 bg/border/rounded/固定宽度 |

## 样式映射参考

| Figma 颜色值                                | figma-theme 变量      | Tailwind class           |
| ------------------------------------------- | --------------------- | ------------------------ |
| `#141419` (面板背景)                        | `--f-bg-base`         | `bg-f-bg-base`           |
| `rgba(255,255,255,0.04)` (卡片/按钮底色)    | `--f-bg-layout`       | `bg-f-bg-layout`         |
| `rgba(255,255,255,0.06)` (hover 底色)       | `--f-bg-hover`        | `bg-f-bg-hover`          |
| `rgba(255,255,255,0.14)` (边框)             | `--f-border`          | `border-f-border`        |
| `rgba(255,255,255,0.85)` (项目名/hover文字) | `--f-text-secondary`  | `text-f-text-secondary`  |
| `rgba(255,255,255,0.65)` (+Project 文字)    | `--f-text-tertiary`   | `text-f-text-tertiary`   |
| `rgba(255,255,255,0.40)` (默认项目/箭头)    | `--f-text-quaternary` | `text-f-text-quaternary` |
| `rgba(255,52,102,1.00)` (选中态文字)        | `--f-primary`         | `text-f-primary`         |

## 数据字段映射

| Figma 展示            | 数据来源                                                |
| --------------------- | ------------------------------------------------------- |
| "Default Project 002" | `currentProject?.projectName \|\| DEFAULT_PROJECT_NAME` |
| "Workspace" 标签      | 硬编码（已在 HeaderActions 中实现）                     |
| "+Project" 按钮文字   | `<Trans>Project</Trans>`                                |
| 项目列表              | `projectList` from `api.userProject.getListV2`          |

## 注意事项

1. **DynamicPopover trigger 行为**：DynamicPopover 在支持 hover 的设备上默认使用 `trigger='hover'`。代码中传入 `trigger='click'`，但 DynamicPopover 内部 `isHoverSupported` 分支会忽略此 prop。若 PC 端出现 hover 就触发弹出的问题，需修改 DynamicPopover 或改用 antd Popover。
2. **Tailwind 排序 WARNING**：`cls` 模板中 `isInline` ternary 会导致 Tailwind class order 插件误报，不影响功能。
3. **renderDropdownContent 调用方式变更**：PC 端 `content={renderDropdownContent()}`（无参数 → isInline=undefined → 弹出面板样式）；移动端 `renderDropdownContent(true)`（内联样式）。
4. **rc-trigger 全局 mousedown 与两套 open 状态**：antd Popover/Dropdown 底层 `@rc-component/trigger` 的 `useWinClick` hook 在 `open=true` 且 `popupEle` 存在时，会在 `window` 注册全局 `mousedown` 监听器检测外部点击。该监听器不受 CSS `display:none` 影响。若移动端/PC 端共用单一 `open` 状态且通过 CSS 切换显隐，移动端内联面板中的点击会被隐藏的 DynamicPopover 判定为"外部点击"并意外关闭。拆分为 `mobileOpen`/`pcOpen` 后，移动端 `pcOpen` 恒为 `false`，DynamicPopover 不创建弹出层 DOM（`popupEle` 不存在），`useWinClick` 不注册监听器，彻底消除干扰。
