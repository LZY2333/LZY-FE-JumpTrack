# use-cases 页面重构改动文档

> Figma 桌面端：`node-id=97574-59394`
> Figma 卡片实例：`node-id=97574-59400`
> Figma 移动端：`node-id=97684-154546`

---

## 一、改动范围

| 文件 | 改动类型 |
|---|---|
| `use-cases/_components/FormSelector/index.tsx` | 重构 |
| `use-cases/_components/TemplateList/index.tsx` | 重构 |
| `use-cases/index.page.tsx` | 微调（AppsTypeSegmented 吸顶） |

不涉及改动：`HeroBannerSlider`

---

## 零、AppsTypeSegmented 吸顶

在 `index.page.tsx` 的 `MenuLayout` 内，`AppsTypeSegmented` 外层包一个 sticky 容器：

```tsx
<MenuLayout className='pb-8'>
  <div className="sticky top-0 z-10 bg-f-bg-layout">
    <AppsTypeSegmented value={AppsTypeValue.Apps} />
  </div>
  <HeroBannerSlider ... />
  <FormSelector ... />
</MenuLayout>
```

- `sticky top-0`：随页面滚动，碰到顶部后固定
- `z-10`：遮盖下方卡片内容
- `bg-f-bg-layout`：防止下方内容透出

---

## 二、FormSelector 改动

### 核心变化：移除次级 Tab，改为全量分类瀑布展示

**现有逻辑：**

- 维护 `activeTab` 状态 + 横向 pill tab 栏 → 每次只渲染当前分类的 `TemplateList`

**新逻辑：**

- **移除** 次级分类 tab 栏（`CarouselBase` pill tabs 整块删除）
- 直接渲染所有非空分类，每个分类一个带 `id` 的 section
- 无 `activeTab` 状态

**`?category=xxx` URL 参数：保留，改为锚点滚动**

`initialActiveTab` prop 改为 `initialScrollTo`，页面挂载后滚动到对应 section：

```tsx
interface FormSelectorProps {
  initialCategories?: SubCategoriesWithTemplates
  initialScrollTo?: string   // 原 initialActiveTab，现改为锚点目标
  showTitle?: boolean
}

// 组件内
useEffect(() => {
  if (!initialScrollTo) return
  const el = document.getElementById(`section-${initialScrollTo}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}, [initialScrollTo])
```

**新结构示意：**

```tsx
{categories
  .filter(c => c.resources?.length > 0)
  .map(category => (
    <section key={category.categoryCode} id={`section-${category.categoryCode}`}>
      <h2 className="text-f-text-secondary mb-3
                     text-lg font-semibold md:text-sm">
        {category.title}
      </h2>
      <TemplateList templateList={category.resources} />
    </section>
  ))
}
```

**Section 标题样式：**

| 属性 | 移动端 | 桌面端 |
|---|---|---|
| 字号 | `text-lg`（18px） | `text-sm`（14px） |
| 字重 | `font-semibold`（600） | `font-semibold`（600） |
| 颜色 | `text-f-text-secondary` | `text-f-text-secondary` |

---

## 三、TemplateList 改动

### 3.1 布局：响应式条件渲染

**方案：`useMediaQuery` 判断断点，条件渲染两套容器**（避免双 DOM）

```tsx
const isMd = useMediaQuery('(min-width: 768px)')

return isMd
  ? (
    // 桌面：CarouselBase 横向滚动行
    <CarouselBase
      align='start'
      cover={false}
      wheelGestures={{ forceWheelAxis: 'x' }}
      containerClassName='gap-3'
      data={templateList}
      renderItem={(item) => <TemplateCard item={item} />}
    />
  )
  : (
    // 移动端：2 列网格
    <div className="grid grid-cols-2 gap-2">
      {templateList?.map(item => <TemplateCard key={item.id} item={item} />)}
    </div>
  )
```

| | 现有 | 桌面新版 | 移动端新版 |
|---|---|---|---|
| 外层 | `grid grid-cols-2/3/4` | `CarouselBase` 横向滚动行 | `grid grid-cols-2` |
| gap | `gap-4` | `gap-3`（12px） | `gap-2`（8px） |
| 卡片数 ≤ 6 | — | 直接平铺，无需滚动 | 直接平铺，无需滚动 |

### 3.2 卡片尺寸

**改为 `aspect-[4/3]` 响应式比例，桌面额外固定宽度：**

| 断点 | 尺寸 | 圆角 |
|---|---|---|
| 桌面（`md+`） | `w-[260px] aspect-[4/3]`（等同 260×195） | `rounded-xl`（12px） |
| 移动端（`< md`） | `w-full aspect-[4/3]`（随列宽自适应，保持 4:3） | `rounded-xl`（12px） |

> Figma 桌面 260×195、移动端 195×146 均为 4:3 比例，统一用 `aspect-[4/3]` 可兼容任意宽度。

### 3.3 卡片整体结构

```
Card（aspect-[4/3]，w-[260px] md:w-full，rounded-xl，overflow-hidden）
├── 背景层：图片/视频 fill cover + 底部渐变蒙层
├── 内容层（absolute inset-0，column space-between，padding: 12px）
│   ├── 顶行（row justify-between）
│   │   ├── 左容器：角标 badge（Coming Soon / Agent / 空 div）
│   │   └── 右容器：平台图标 badge（无时不渲染）
│   └── 底：标题文字（fill width）
└── 交互层（absolute inset-0，z-[1]，Link / onClick）
```

### 3.4 背景层

```
linear-gradient(180deg, rgba(0,0,0,0) 73%, rgba(0,0,0,0.8) 96%)
```

上方 73% 完全透明，96% 处过渡至 `rgba(0,0,0,0.8)`，集中在底部为标题提供遮罩。

```tsx
{coverVideo ? (
  <LazyVideo
    src={coverVideo}
    poster={coverImage}
    fill
    className="object-cover"
    eventsPlay={{ action: 'hover', ref: containerRef }}
  />
) : (
  <LazyImage src={coverImage} alt={item.title || ''} fill className="object-cover" />
)}
<div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_73%,rgba(0,0,0,0.8)_96%)]" />
```

### 3.5 内容层

```tsx
<div className="absolute inset-0 flex flex-col justify-between p-3">
```

`padding: 12px` 四边均等，`column space-between`：顶行顶对齐，标题底对齐。

### 3.6 顶行：角标 + 平台图标

**布局：`justify-between`，左容器永远贴左，右图标永远贴右。**

```tsx
{(isComingSoon || isAgentTool || mediaIcon?.length > 0) && (
  <div className="flex items-start justify-between">
    {/* 左：角标（无状态时渲染空 div 保持占位）*/}
    <div>
      {isComingSoon && (
        <div className="rounded-md bg-black/35 px-1.5 py-[3px]">
          <span className="text-[9px] font-semibold leading-[1.33] text-white/95">
            Coming Soon
          </span>
        </div>
      )}
      {!isComingSoon && isAgentTool && (
        <div className="flex items-center gap-[3px] rounded-md bg-black/35 px-1.5 py-[3px]">
          <CssIcon className="i-cus--pol-star-four size-[9px] text-white" />
          <span className="text-[9px] font-semibold leading-[1.33] text-white/95">Agent</span>
        </div>
      )}
    </div>
    {/* 右：平台图标 */}
    {!isComingSoon && mediaIcon?.length > 0 && (
      <div className="flex items-center gap-1 rounded bg-black/35 px-1 py-0.5">
        {mediaIcon.map(icon => (
          <CssIcon key={icon} className={`${icon} size-3.5 text-white/85`} />
        ))}
      </div>
    )}
  </div>
)}
```

**角标 badge 样式：**

| 属性 | Coming Soon | Agent |
|---|---|---|
| 图标 | **无** | `i-cus--pol-star-four`，9×9px，`#FFFFFF` |
| 文字 | "Coming Soon" | "Agent" |
| 字号/字重 | `9px / 600` | `9px / 600` |
| 文字颜色 | `rgba(255,255,255,0.96)` | `rgba(255,255,255,0.96)` |
| 背景 | `rgba(0,0,0,0.35)` | `rgba(0,0,0,0.35)` |
| 圆角 | `6px`（`rounded-md`） | `6px`（`rounded-md`） |
| padding | `3px 6px` | `3px 6px` |

**平台图标 badge：**

| 属性 | 现有 | 新版 |
|---|---|---|
| 位置 | `absolute end-1.5 top-1.5` | 顶行右容器（flow 内） |
| 背景 | `color-mix(in srgb, var(--f-other-5) 15%, transparent)` | `rgba(0,0,0,0.35)` |
| 圆角 | `rounded` | `rounded`（4px） |
| padding | `px-1 py-0.5` | `px-1 py-0.5` |
| 图标尺寸 | `size-4`（16px） | `size-3.5`（14px） |
| 图标颜色 | `text-f-text-secondary` | `text-white/85` |

### 3.7 底部：标题

| 属性 | 现有 | 新版 |
|---|---|---|
| 容器 | `absolute bottom-0`，`bg-f-other-2 backdrop-blur-lg`，`text-center` | 无独立容器，继承 `p-3` |
| blur | `backdrop-blur-lg` | **无** |
| 字号 | `text-xs md:text-lg` | `text-sm`（14px） |
| 字重 | `font-semibold` | `font-semibold` |
| 颜色 | `text-f-text-secondary` hover `text-f-text` | `text-white`（`#FFFFFF`） |
| 对齐 | 居中 | 左对齐 |

```tsx
<p className="w-full truncate text-sm font-semibold text-white">{item.title}</p>
```

### 3.8 Hover 效果（新增）

```tsx
className="... transition-transform duration-200 hover:scale-[1.03]"
```

加在外层卡片容器上，整卡放大。

### 3.9 完整保留项

| 要素 | 保留方式 |
|---|---|
| **Coming Soon / Agent 逻辑** | `isComingSoon`、`isAgentTool` 判断不变，badge 样式按 3.6 更新 |
| **gradient-border hover** | 外层容器保留 `gradient-border` / `gradient-border-item` |
| **coverVideo 悬停播放** | `LazyVideo` + `eventsPlay: { action: 'hover', ref }` 不变 |
| **图片/视频 SSR** | 继续用 `LazyImage fill` / `LazyVideo fill`，`<img>`/`<video poster>` 仍输出到初始 HTML |
| **UseCases Link** | `absolute inset-0 z-[1]` 不变 |
| **Agent 点击 handler** | `handleAgentEnter(item.code)` 不变 |

### 3.10 卡片结构 diff

```diff
- <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
-   {templateList?.map(item => (
-     <div className="gradient-border group relative w-full cursor-pointer">
-       <div className="bg-f-bg-base gradient-border-item relative h-full overflow-hidden rounded-lg">
-         {/* Coming Soon — absolute span，bg-f-bg-base */}
-         {/* Agent — absolute div，star icon + text */}
-         {/* 平台图标 — absolute end-1.5 top-1.5，color-mix bg */}
-         <div className="relative aspect-[4/3]">
-           <LazyVideo/LazyImage ... />
-         </div>
-         {/* 标题 — absolute bottom-0，backdrop-blur-lg，text-center */}
-         <div className="bg-f-other-2 absolute bottom-0 w-full backdrop-blur-lg ...">
-           <p className="text-xs md:text-lg">{item.title}</p>
-         </div>
-       </div>
-     </div>
-   ))}
- </div>

+ {/* 桌面: CarouselBase; 移动端: grid grid-cols-2 gap-2（useMediaQuery 切换）*/}
+   {templateList?.map(item => (
+     <div className="gradient-border group relative shrink-0
+                     w-full aspect-[4/3] md:w-[260px]
+                     cursor-pointer transition-transform duration-200 hover:scale-[1.03]">
+       <div className="gradient-border-item relative size-full overflow-hidden rounded-xl">
+         {/* 背景图/视频 fill + 底部渐变蒙层 */}
+         <LazyVideo/LazyImage fill className="object-cover" ... />
+         <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_73%,rgba(0,0,0,0.8)_96%)]" />
+         {/* 内容层 */}
+         <div className="absolute inset-0 flex flex-col justify-between p-3">
+           {/* 顶行：左角标 + 右图标，各自贴边 */}
+           {(isComingSoon || isAgentTool || mediaIcon?.length > 0) && (
+             <div className="flex items-start justify-between">
+               <div>
+                 {isComingSoon && (
+                   <div className="rounded-md bg-black/35 px-1.5 py-[3px]">
+                     <span className="text-[9px] font-semibold leading-[1.33] text-white/95">
+                       Coming Soon
+                     </span>
+                   </div>
+                 )}
+                 {!isComingSoon && isAgentTool && (
+                   <div className="flex items-center gap-[3px] rounded-md bg-black/35 px-1.5 py-[3px]">
+                     <CssIcon className="i-cus--pol-star-four size-[9px] text-white" />
+                     <span className="text-[9px] font-semibold leading-[1.33] text-white/95">Agent</span>
+                   </div>
+                 )}
+               </div>
+               {!isComingSoon && mediaIcon?.length > 0 && (
+                 <div className="flex items-center gap-1 rounded bg-black/35 px-1 py-0.5">
+                   {mediaIcon.map(icon => (
+                     <CssIcon key={icon} className={`${icon} size-3.5 text-white/85`} />
+                   ))}
+                 </div>
+               )}
+             </div>
+           )}
+           {/* 底部标题 */}
+           <p className="w-full truncate text-sm font-semibold text-white">{item.title}</p>
+         </div>
+         {/* Link / Agent handler 保留 */}
+       </div>
+     </div>
+   ))}
```

---

## 四、响应式断点对应关系

| 断点 | 卡片排布 | 卡片尺寸 | Section 标题 |
|---|---|---|---|
| `< md`（移动端） | `grid grid-cols-2 gap-2`，≤6 张无需滚动 | `w-full aspect-[4/3]` | `text-f-text-secondary text-lg/600` |
| `md+`（桌面） | `CarouselBase` 横向滚动行，`gap-3` | `w-[260px] aspect-[4/3]` | `text-f-text-secondary text-sm/600` |

---

## 五、参照组件

- `CarouselBase`：`web/src/pages/pollo.ai/_components/Carousel/CarouselBase/index.tsx`
  - 已内置 Embla + WheelGesturesPlugin，`align='start'`，`cover={false}` 即为多 item 横向行
  - 参照 `SingleSlideCarousel` 的 `containScroll: 'keepSnaps'` 防止末尾留白

CarouselBase 改为使用 SingleSlideCarousel 是否方便,是否需要修改 SingleSlideCarousel 源码
  ⎿  ⧉ Selected 1 lines from web/src/pages/pollo.ai/use-cases/_components/TemplateList/index.tsx in Cursor

⏺ 直接对比 API 和内部逻辑：

  SingleSlideCarousel 的核心设计：

- list: CarouselListData[] — 固定数据结构，非泛型
- 每次只展示 1 个 slide（全宽），非多卡片并排
- 内置 Autoplay（5s 自动播放）
- 内置 SlideProgress 底部进度点
- 内部渲染 <CarouselItem>，不接受 renderItem 回调
- 使用 useBannerTrack / TrackElement 做 banner 专用埋点

  要用它替换 CarouselBase，必须改源码，且改动量极大：

  ┌──────────────────────────┬─────────────────────────────────────────┬────────────────────────┐
  │           需求           │        当前 SingleSlideCarousel         │        需要改动        │
  ├──────────────────────────┼─────────────────────────────────────────┼────────────────────────┤
  │ 泛型数据 + 自定义 render │ ❌ 固定 CarouselListData + CarouselItem │ 重写核心结构           │
  ├──────────────────────────┼─────────────────────────────────────────┼────────────────────────┤
  │ 多卡片并排               │ ❌ 单 slide 全宽                        │ 修改 embla 配置 + 布局 │
  ├──────────────────────────┼─────────────────────────────────────────┼────────────────────────┤
  │ 关闭自动播放             │ ❌ 硬编码 Autoplay 插件                 │ 删除或条件化           │
  ├──────────────────────────┼─────────────────────────────────────────┼────────────────────────┤
  │ 移动端 2 列宽卡片        │ ❌ 无此概念                             │ 新增                   │
  ├──────────────────────────┼─────────────────────────────────────────┼────────────────────────┤
  │ 关闭进度点               │ 有 showProgress prop ✅                 │ 无需改                 │
  └──────────────────────────┴─────────────────────────────────────────┴────────────────────────┘

  改完之后基本是一个新组件，且会破坏其他页面（HeroBannerSlider 等在用它）。

  结论：不值得切换，继续用 CarouselBase。
