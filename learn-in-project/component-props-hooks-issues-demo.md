# 组件可读性问题（合并版 4 类）

> 目标：把之前的 5 类典型问题，合并到你给的 4 类问题框架中，并给出可复用 demo（仅保留关键代码，省略非重点内容）。

---

## 1) 阅读代码必须在“调用方 ↔ 组件”来回切换，且调用方传入信息过多、未做 props 分组收束

### Demo

```tsx
// web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx:33-49
interface IDetailProps {
  className?: string
  videoDetail: CreationItem
  isModal?: boolean
  actions?: IVideoDetailActions
  currentSelectedGenerationIndex?: number
  isFromCanvas?: boolean
  createSimilarClick?: (...) => void
  setIsShowLoraDetail?: (...) => void
  useGeneration?: boolean
  openInNewWindow?: boolean
}

// ...省略

// web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx:189-198
<DetailPrimitive.Root
  className={className}
  videoDetail={videoDetail}
  projectDetail={projectDetail}
  isMySelf={isMySelf}
  isImage={isImage}
  isFromCanvas={isFromCanvas}
  menuOptionsData={menuOptionsData}
  currentSelectedGenerationIndex={currentSelectedGenerationIndex}
  entryCode={videoDetail.generateRecord?.entryCode as EntryCodeType}
/>

// web/src/pages/pollo.ai/v/[id]/_blocks/Detail/primitive/context.ts:8-17
export interface IDetailContext {
  videoDetail: VideoDetailVo
  currentSelectedGenerationIndex: number
  isMySelf: boolean
  isImage: boolean
  isFromCanvas: boolean
  menuOptionsData: IMenuCoreOptionsProps['data']
  projectDetail?: RouterOutputs['userProject']['getDetail']
  entryCode?: EntryCodeType
}
```

### 观察

- 单个调用点传入字段很多且平铺，缺少按域分组（如 `viewState` / `actions` / `tracking`）。
- 阅读时要在 `Detail/index.tsx`、`Root.tsx`、`context.ts` 之间反复跳转，成本高。

**涉及文件位置**

- `web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx:33`
- `web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx:189`
- `web/src/pages/pollo.ai/v/[id]/_blocks/Detail/primitive/context.ts:8`

---

## 2) 非通用组件暴露过多 props，把控制权交给外部

### Demo

```tsx
// web/src/pages/pollo.ai/v/[id]/_blocks/Detail/Footer/CreateSimilarVideo/index.tsx:20-27
interface ICreateSimilarVideoProps
  extends ButtonProps,
    Pick<IIconWithTooltipProps, 'showTooltip' | 'tooltipProps'> {
  data: CreationItem
  text: React.ReactNode
  protectedText?: React.ReactNode
  openInNewWindow?: boolean
}

// web/src/pages/pollo.ai/v/[id]/_blocks/Detail/Footer/CreateSimilarVideo/index.tsx:29-37
const {
  data,
  showTooltip,
  tooltipProps,
  text,
  protectedText,
  openInNewWindow = false,
  ...restProps
} = props

// web/src/pages/pollo.ai/v/[id]/_blocks/Detail/Footer/CreateSimilarVideo/index.tsx:62-66
<Button
  className={...}
  type='primary'
  {...restProps}
  onClick={() => { /* ...省略 */ }}
/>
```

```tsx
// web/src/pages/pollo.ai/_components/MenuOptions/_components/OptionButton/index.tsx:12-13
const OptionButton = (props: Omit<ButtonProps, 'children' | 'onClick'> & MenuOption) => {
    // ...省略

    // web/src/pages/pollo.ai/_components/MenuOptions/_components/OptionButton/index.tsx:53
    return <Button {...restProps} />;
};
```

### 观察

- 业务组件直接继承 `ButtonProps`，再把 `...restProps` 下发到 UI 底层，外部控制面过大。
- `MenuOption` 业务字段与 Button 字段混合，组件边界变模糊。

**涉及文件位置**

- `web/src/pages/pollo.ai/v/[id]/_blocks/Detail/Footer/CreateSimilarVideo/index.tsx:20`
- `web/src/pages/pollo.ai/v/[id]/_blocks/Detail/Footer/CreateSimilarVideo/index.tsx:65`
- `web/src/pages/pollo.ai/_components/MenuOptions/_components/OptionButton/index.tsx:12`
- `web/src/pages/pollo.ai/_components/MenuOptions/_components/OptionButton/index.tsx:53`

---

## 3) props 长链路传递，但终点未消费

### Demo

```tsx
// web/src/pages/pollo.ai/_layout/Header/index.tsx:229-234
<HeaderMenu
  showHeaderMenu={showHeaderMenu}
  isMobileMenuOpen={isMobileMenuOpen}
  locales={locales}
  showLoginUserInfo={showLoginUserInfo}
  setIsMobileMenuOpen={setIsMobileMenuOpen}
/>

// web/src/pages/pollo.ai/_layout/Header/HeaderMenu/index.tsx:42
<PCMenu localesList={localesList} showLoginUserInfo={showLoginUserInfo} />

// web/src/pages/pollo.ai/_layout/Header/HeaderMenu/_block/PCMenu/index.tsx:54-79
<AiList ... showLoginUserInfo={showLoginUserInfo} ... />
<GroupList ... showLoginUserInfo={showLoginUserInfo} />

// web/src/pages/pollo.ai/_layout/Header/HeaderList/AiList/index.tsx:27
export const AiList: React.FC<AiListProps> = ({ aiList, type, col = 3 }) => {
  // 未消费 showLoginUserInfo
}

// web/src/pages/pollo.ai/_layout/Header/HeaderList/GroupList/index.tsx:28-33
export const GroupList: React.FC<ToolListProps> = ({
  groupTab,
  showLoginUserInfo,
  className,
  wrapperClassName,
}) => {
  // showLoginUserInfo 未使用
}
```

### 观察

- `showLoginUserInfo` 存在跨多层传递，但在终点未参与行为判断，属于“无效长链路”。

**涉及文件位置**

- `web/src/pages/pollo.ai/_layout/Header/index.tsx:229`
- `web/src/pages/pollo.ai/_layout/Header/HeaderMenu/index.tsx:42`
- `web/src/pages/pollo.ai/_layout/Header/HeaderMenu/_block/PCMenu/index.tsx:54`
- `web/src/pages/pollo.ai/_layout/Header/HeaderList/AiList/index.tsx:27`
- `web/src/pages/pollo.ai/_layout/Header/HeaderList/GroupList/index.tsx:28`

---

## 4) 组件/hooks 文件组织与层级较混杂，职责不清晰

### Demo A：单个 hook 混合多职责（状态、请求、事件总线、全局状态）

```ts
// web/src/pages/pollo.ai/v/[id]/_hooks/useVideoDetail.ts:10-15
export const useUpdateVideoDetail = (videoData: CreationItem, isModal?: boolean) => {
  const [videoDetail, setVideoDetail] = useState<CreationItem>(videoData)
  // ...省略

  // web/src/pages/pollo.ai/v/[id]/_hooks/useVideoDetail.ts:25-40
  const { refetch } = api.video.getVideoDetail.useQuery(...)

  // web/src/pages/pollo.ai/v/[id]/_hooks/useVideoDetail.ts:55-61
  videoDetailEmitter.emit('update-video-detail', { videoItem: videoData, type })
  setVideoDetail(videoData)

  // web/src/pages/pollo.ai/v/[id]/_hooks/useVideoDetail.ts:76-85
  updateStateValues({ isProtected })
}
```

### Demo B：公共组件层级过深，阅读路径长

```ts
// web/src/pages/pollo.ai/v/[id]/_blocks/Detail/primitive/index.ts:1
export * as DetailPrimitive from './internal'

// web/src/pages/pollo.ai/v/[id]/_blocks/Detail/primitive/internal.ts:1-9
export { Container } from './Container'
export { Left } from './Left'
export { LeftBottom } from './LeftBottom'
export { LeftTop } from './LeftTop'
export { Right } from './Right'
export { RightBottom } from './RightBottom'
export { RightTop } from './RightTop'
export { Root } from './Root'

// web/src/pages/pollo.ai/v/[id]/_blocks/Detail/primitive/Root.tsx:10-12
export function Root({ className, children, ...context }: IDetailProps) {
  return <DetailContextProvider {...context}>{/* ...省略 */}</DetailContextProvider>
}
```

### 观察

- Hook 内职责边界不清，后续变更容易产生“改 A 牵动 B/C”。
- `primitive` 层级引入后，符号入口统一了，但新同学排查路径变长（`index.ts -> internal.ts -> 具体组件`）。

**涉及文件位置**

- `web/src/pages/pollo.ai/v/[id]/_hooks/useVideoDetail.ts:10`
- `web/src/pages/pollo.ai/v/[id]/_hooks/useVideoDetail.ts:25`
- `web/src/pages/pollo.ai/v/[id]/_hooks/useVideoDetail.ts:55`
- `web/src/pages/pollo.ai/v/[id]/_hooks/useVideoDetail.ts:76`
- `web/src/pages/pollo.ai/v/[id]/_blocks/Detail/primitive/index.ts:1`
- `web/src/pages/pollo.ai/v/[id]/_blocks/Detail/primitive/internal.ts:1`
- `web/src/pages/pollo.ai/v/[id]/_blocks/Detail/primitive/Root.tsx:10`
