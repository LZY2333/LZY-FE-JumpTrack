# 改动计划：`/ai-image-generator/[code]` 表单模式 → Chat 模式

## 背景

### 三个相关页面

| 路由                                         | 作用                              | 核心目录                                                 |
|----------------------------------------------|-----------------------------------|----------------------------------------------------------|
| `/image-generators`                          | 列表页（选工具）                    | `web/src/pages/pollo.ai/image-generators/`               |
| `/ai-image-generator/[code]`                 | 子工具详情页（表单模式 + SEO 区块） | `web/src/pages/pollo.ai/ai-image-generator/[...params]/` |
| `/app?target=image-generators-tool&code=xxx` | 工作台（左表单+右信息流）           | `app/_home/components/AIGeneratorsTool.tsx`              |

三者共享 CMS 数据源 `pollo_image_generators` 表，通过 `url`/`code` 字段关联。

### 现状

- `/ai-image-generator`（主页）**已支持 chat mode**（`supportChatMode` + `useChatEntryProps` + `CreationLayout`）
- `/ai-image-generator/[code]`（子工具页）仍为**纯表单模式**，无 chat mode
- 项目中已有 **5 个工具页完成表单→chat 模式迁移**（text-to-image、image-to-image、text-to-video、image-to-video、consistent-character-video），模式统一

### 需求

将 `/ai-image-generator/[code]`（如 `/ai-image-generator/cad-drawing`）从表单模式升级为 chat 模式：

- **路由不变**：仍为 `/ai-image-generator/cad-drawing`
- **功能**：image-to-image
- **默认模型**：Pollo Image 2.0（`EImageModel.PolloImageV2`）
- **CMS 数据保留**：preset prompt、工具名称、SEO 区块

---

## 核心思路

对标 `/ai-image-generator/index.page.tsx`（主页已实现 chat 模式），给 `[...params]/index.page.tsx` 加上同样的 `supportChatMode` + `useChatEntryProps` + `CreationGuide`，同时保留现有 CMS 数据（preset prompt、工具名、SEO 区块）。

---

## 改动文件

### 1. `[...params]/index.page.tsx` — 主改动

**文件路径**：`web/src/pages/pollo.ai/ai-image-generator/[...params]/index.page.tsx`

```diff
+ import CreationGuide from '../../_components/CreationGuide'
+ import CreationLayout from '../../_layout/layouts/CreationLayout'
+ import useChatEntryProps from '../../_layout/layouts/CreationLayout/_hooks/useChatEntryProps'
+ import { EntryCodeType } from '@loc/server/enums/video.common'

  export const Page: TNextPagePro<...> = (props) => {
    const { pageData, slug, reviews } = props
    const { imageGeneratorName, imageGeneratorDemoImage, description } =
      pageData || {}

+   const { chatEntryProps } = useChatEntryProps({
+     type: EntryCodeType.TextToImage,
+     initialPrompt: pageData?.prompt,
+   })

    const guideProps = {
      title: imageGeneratorName,
      description,
      images: [imageGeneratorDemoImage || ''],
    }

    return (
      <FormStoreProvider initialState={{ modelFreeStatus: {} }}>
        <MenuLayout isCompactMenu isChatMode contentClassName='pt-0 max-w-full'>
-         <CreationLayout guide={<CreationGuide {...guideProps} />}>
+         <CreationLayout
+           supportChatMode
+           guide={<CreationGuide {...guideProps} />}
+           chatEntryProps={chatEntryProps}
+         >
            <FormGenerate
              arrowBackLink='/image-generators'
              isFromTool
              initialValues={{ model: EImageModel.FluxDevLora }}
              title={imageGeneratorName}
              isH1Dom
              prompt={pageData?.prompt}
              inflowCode={Array.isArray(slug) ? slug[0] : undefined}
            />
          </CreationLayout>

          {/* Breadcrumb + Main SEO 区块保持不变 */}
          {breadcrumbData && breadcrumbData?.length > 1 ? (
            <Breadcrumb ... />
          ) : null}

          {pageData ? (
            <Main pageData={pageData} reviews={reviews || null} />
          ) : null}
        </MenuLayout>
      </FormStoreProvider>
    )
  }
```

**效果**：

- 桌面端（lg+）：FormGenerate 隐藏，底部显示 ChatEntry 输入框 + 右侧 CreationPanel 结果流
- 移动端（<lg）：保持原表单模式不变（CreationLayout 内置的响应式逻辑）
- 下方 SEO 区块（Breadcrumb + Main）不受影响

### 2. `useChatEntryProps.ts` — 扩展支持 preset prompt

**文件路径**：`web/src/pages/pollo.ai/_layout/layouts/CreationLayout/_hooks/useChatEntryProps.ts`

```diff
  interface UseChatEntryProps {
    type?: Extract<EntryCodeType, ...>
+   initialPrompt?: string
  }

  export default function useChatEntryProps(props: UseChatEntryProps) {
-   const { type } = props
+   const { type, initialPrompt } = props

    const chatEntryProps = useMemo(() => {
      return match(type)
        .with(
          P.union(EntryCodeType.TextToImage, EntryCodeType.ImageToImage),
          () => ({
            defaultChatTab: ChatGenerationSelect.Image,
            initialImageValues: {
              modelName: urlModelName || EImageModel.PolloImageV2,
+             prompt: initialPrompt,
            },
          }),
        )
        // ...其余分支不变
-   }, [type, urlModelName])
+   }, [type, urlModelName, initialPrompt])
  }
```

### 3. 无需改动的文件（已验证）

`ImageItem/index.tsx:110-118` 中 `initialValues.prompt` 会被 `...initialValues` 自然展开注入表单：

```typescript
const [formInitialValues] = useState(() => {
  return {
    dev: false,
    modelName: defaultModel,
    ...localFormValues,
    ...initialValues,  // ← prompt 会被展开到这里 ✅
  }
})
```

---

## 不改动的文件

| 文件                                | 原因                                  |
|-------------------------------------|---------------------------------------|
| `[...params]/data.server.ts`        | SSR 数据获取逻辑不变，CMS 数据照常拉取 |
| `[...params]/_block/Main.tsx`       | SEO 营销区块保持原样                  |
| `CreationLayout/index.tsx`          | 已有 `supportChatMode` 逻辑，无需改动  |
| `ChatEntry/index.tsx`               | 已支持 `initialImageValues` 透传      |
| `FormGenerate/index.tsx`            | 作为移动端回退，代码不变               |
| Layout 链（RootLayout/DefaultLayout） | SEO、Header/Footer 不变                |

---

## 改动总结

| 文件                         | 改动量 | 内容                                    |
|------------------------------|--------|-----------------------------------------|
| `[...params]/index.page.tsx` | ~10 行 | 加 `supportChatMode` + `chatEntryProps` |
| `useChatEntryProps.ts`       | ~5 行  | 扩展 `initialPrompt` 参数               |

**总计约 15 行改动**，完全复用现有 chat mode 基础设施。

---

## 行为对比

|                   | 改造前                            | 改造后                                  |
|-------------------|-----------------------------------|-----------------------------------------|
| 桌面端 UI         | 左侧 FormGenerate 表单            | 底部 ChatEntry + 右侧结果流             |
| 移动端 UI         | FormGenerate 表单                 | FormGenerate 表单（不变）                 |
| 默认模型          | FluxDevLora                       | PolloImageV2（由 useChatEntryProps 决定） |
| CMS preset prompt | 注入到 FormGenerate               | 注入到 ChatEntry 的 ImageItem           |
| SEO 区块          | 滚动可见                          | 滚动可见（不变）                          |
| 路由              | `/ai-image-generator/cad-drawing` | `/ai-image-generator/cad-drawing`（不变） |

---

## 关键文件路径

- `web/src/pages/pollo.ai/ai-image-generator/[...params]/index.page.tsx`
- `web/src/pages/pollo.ai/_layout/layouts/CreationLayout/_hooks/useChatEntryProps.ts`
- `web/src/pages/pollo.ai/_layout/layouts/CreationLayout/index.tsx`
- `web/src/pages/pollo.ai/_components/ChatEntry/index.tsx`
- `web/src/pages/pollo.ai/_components/ChatEntry/_components/ChatInput/_components/ImageItem/index.tsx`
- `web/src/pages/pollo.ai/ai-image-generator/Main/_components/FormGenerate/index.tsx`
- `web/src/pages/pollo.ai/ai-image-generator/[...params]/data.server.ts`
- `web/src/pages/pollo.ai/ai-image-generator/[...params]/_block/Main.tsx`
- `web/src/pages/pollo.ai/_components/CreationGuide/index.tsx`
