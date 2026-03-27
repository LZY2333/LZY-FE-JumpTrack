# Assets My Avatar Tab 改造分析

## 需求概述

改版后用户失去了「我的数字人」管理入口，需在 Assets 页面新增 **Avatar** Tab，承载数字人的创建和使用功能。

## 设计稿概览

- Figma: `KQ9bDgtprgbJqu9mJhgcDY` node `95685-172383`
- Tab 栏顺序：Image / Video / Agent / **Avatar** / Canvas
- Avatar Tab 内容：创建入口卡片 + 数字人卡片横向滚动列表
- 不需要子 Tab（All / Featured / My Avatars 设计稿中为 HIDDEN）
- 只展示个人创建的数字人

### Figma 目标结构

```
┌──────────────────────────────────────────────────────────┐
│  Tabs: Image | Video | Agent | [Avatar] | Canvas         │
├──────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │  + icon  │ │  封面图  │ │  封面图  │ │  封面图  │ ... │
│ │          │ │          │ │  (hover) │ │          │     │
│ │ Create   │ │ ELAINE A │ │ [Use the │ │ Name     │     │
│ │my avatar │ │  ▶ play  │ │  Avatar] │ │  ▶ play  │     │
│ │(203×360) │ │(203×360) │ │(203×360) │ │(203×360) │     │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│               ← 水平滚动, gap:8px →                      │
└──────────────────────────────────────────────────────────┘
```

## 数字人卡片规格

| 属性 | 值 |
|------|-----|
| 尺寸 | 203 x 360 |
| 圆角 | 8px (rounded-lg) |
| 名称文字 | font-size:16, font-weight:600, 白色 opacity:0.96 |
| 播放图标 | 24x24, 半透明黑底圆形 (cus-pol-play-1) |
| 卡片间距 | gap:8px, 水平排列 |

### 卡片交互

- **默认态**: 封面图 + 底部名称 + 左上播放图标
- **Hover 态**: 名称淡出，底部显示 "Use the Avatar" 按钮 (pill, r:32, font:14/600)
- 右上角删除按钮（24x24, bg rgba(0,0,0,0.35)）hover 时出现

## 改造项列表

| # | 改造名称 | 涉及文件 | 差异类型 |
|---|----------|----------|----------|
| 1 | 添加 avatar 到类型定义 | videoFilter.ts | 新增数据 |
| 2 | 添加 avatar 到 tab 值 | useAssetsTab.ts | 新增数据 |
| 3 | Avatar tab 内容分发 | TabContent.tsx | 条件渲染 |
| 4 | VideoTypeFilter 处理 avatar | VideoTypeFilter/index.tsx | 条件渲染 |
| 5 | 新建 AvatarTabContent 组件 | 新文件 | 新增组件 |

## 改造详情

### videoFilter.ts

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/CreationRecords/RecordsFilters/_hooks/videoFilter.ts

  // --- 改造 #1: 添加 avatar 类型定义 :6 ---
  // --- 需要在类型和列表中同时添加 avatar ---
- export type TVideoListFilterType = EGenerationType | 'all' | 'canvas' | 'agent'
+ export type TVideoListFilterType = EGenerationType | 'all' | 'canvas' | 'agent' | 'avatar'
    ...
  // --- 改造 #1b: 在 baseListType 中 agent 和 canvas 之间插入 avatar :38 ---
      {
        label: t`Agent`,
        value: 'agent',
        onlyIn: ['assets'],
        show: isAgentMode,
      },
+     {
+       label: t`Avatar`,
+       value: 'avatar',
+       onlyIn: ['assets'],
+     },
      {
        label: t`Canvas`,
        value: 'canvas',
        onlyIn: ['assets'],
      },
```

### useAssetsTab.ts

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/assets/_hooks/useAssetsTab.ts

  // --- 改造 #2: 添加 'avatar' 到 ASSETS_TAB_VALUES :7 ---
  // --- Tab 值枚举中新增 avatar ---
  const ASSETS_TAB_VALUES = [
    EGenerationType.Video,
    EGenerationType.Image,
    'canvas',
    'agent',
+   'avatar',
  ] as const
    ...
  // --- 改造 #2b: 新增 isAvatarTab 判断 :25 ---
    const isAgentTab = useMemo(() => currentTab === 'agent', [currentTab])
    const isCanvasTab = useMemo(() => currentTab === 'canvas', [currentTab])
+   const isAvatarTab = useMemo(() => currentTab === 'avatar', [currentTab])
    ...
  // --- 改造 #2c: 导出 isAvatarTab :40 ---
    return {
      currentTab,
      setCurrentTab,
      isAgentTab,
      isCanvasTab,
+     isAvatarTab,
      mediaType,
    }
```

### TabContent.tsx

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/assets/_blocks/AssetsPage/_components/TabContent.tsx

  // --- 改造 #3: 导入 AvatarTabContent :6 ---
+ import { AvatarTabContent } from '../../AvatarTabContent'
    ...
  // --- 改造 #3b: 添加 avatar 分支 :44 ---
  // --- avatar tab 使用独立的内容组件，不复用 MediaContentList ---
    {match(currentTab)
      .with('agent', () => <AgentList onPreview={onPreview} />)
+     .with('avatar', () => (
+       <div
+         ref={scrollContainerRef}
+         className='scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto pr-2'
+       >
+         <AvatarTabContent />
+       </div>
+     ))
      .with('canvas', () => (
```

### VideoTypeFilter/index.tsx

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/assets/_blocks/VideoTypeFilter/index.tsx

  // --- 改造 #4: props 中增加 isAvatarTab :28 ---
+   isAvatarTab: boolean
    ...
  // --- 改造 #4b: tabItems 中 avatar 不显示 Favorites :92 ---
  // --- avatar tab 与 agent/canvas 一样，不需要 Favorites 和批量操作 ---
  const tabItems = useMemo(() => {
-   return currentTab === 'agent' || currentTab === 'canvas'
+   return currentTab === 'agent' || currentTab === 'canvas' || currentTab === 'avatar'
      ? filterList
      : [
          ...filterList,
          ...
  // --- 改造 #4c: RenderTabBarExtraContent 传入 isAvatarTab :145 ---
    <RenderTabBarExtraContent
      wrapperClassName='sm:flex hidden'
      {...renderTabBarExtraContentProps}
      isAgentTab={isAgentTab}
      isCanvasTab={isCanvasTab}
+     isAvatarTab={isAvatarTab}
    />
```

### 新建 AvatarTabContent 组件

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/assets/_blocks/AvatarTabContent/index.tsx
// --- 改造 #5: 新建组件 ---
// --- 复用 AiAvatarBlocks 中的 AiAvatarAdd + AiAvatarShow，调用 usePaginatedAvatar 获取个人数字人列表 ---
+ 新文件，包含：
+   - AiAvatarAdd 创建入口卡片 (首位，同尺寸 203x360)
+   - 数字人卡片列表 (AiAvatarShow，203x360)
+   - 水平滚动布局，gap:8px
+   - "Use the Avatar" 按钮 → 跳转 /ai-avatar?avatarId=xxx
+   - 右上角删除按钮 (hover 显示)
+   - usePaginatedAvatar({ avatarSource: 'personal' }) 获取数据
```

## 现有组件复用

| 组件 | 路径 | 用途 |
|------|------|------|
| `AiAvatarAdd` | `_components/AiAvatarBlocks/AiAvatarAdd/index.tsx` | 创建数字人入口 + 弹窗 |
| `AiAvatarShow` | `_components/AiAvatarBlocks/AiAvatarShow/index.tsx` | 数字人卡片展示（封面+名称+hover视频+按钮） |
| `usePaginatedAvatar` | `_components/AiAvatarBlocks/hooks/fetch.ts` | 分页获取数字人列表 |
| `useDeletePersonalAvatar` | `_components/AiAvatarBlocks/hooks/fetch.ts` | 删除数字人 |
| `GradientButton` | `_components/GradientButton` | 卡片底部操作按钮 |

## 数据流

```
usePaginatedAvatar({ avatarSource: 'personal' })
  → api.avatar.fetchAvatars.useQuery
  → TQueryAvatarItem[]
  → AiAvatarShow 卡片渲染
    - avatarUrl = item.coverImg
    - videoUrl = item.coverVideo
    - name = item.name
    - onClick("Use") → router.push(`/ai-avatar?avatarId=${item.avatarId}`)
```

## 涉及文件

```
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/CreationRecords/RecordsFilters/_hooks/videoFilter.ts:6
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/assets/_hooks/useAssetsTab.ts:7
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/assets/_blocks/AssetsPage/_components/TabContent.tsx:1
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/assets/_blocks/VideoTypeFilter/index.tsx:28
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/assets/_blocks/AvatarTabContent/index.tsx (新建)
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/AiAvatarBlocks/AiAvatarAdd/index.tsx:1
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/AiAvatarBlocks/AiAvatarShow/index.tsx:1
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/AiAvatarBlocks/hooks/fetch.ts:1
```
