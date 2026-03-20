# Header 组件 URL 跳转全量清单

> 数据来源为静态代码分析。「需修改」列基于 Pollo 2.0 需求文档判断。

---

## 1. Header/index.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/index.tsx`

| 行号 | 组件     | URL                          | 说明                        | 需修改 |
|------|----------|------------------------------|-----------------------------|--------|
| 179  | `<Link>` | `/`                          | Logo 跳转首页               | 否     |
| 213  | `<Link>` | `bannerLink \|\| '/pricing'` | 促销 Banner，默认 `/pricing` | 否     |

---

## 2. HeaderMenu/menu.tsx（核心菜单数据源）

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderMenu/menu.tsx`

此文件通过 `useHeaderMenu()` 返回完整导航菜单数据，是大部分 URL 的唯一定义处。

### 2.1 一级菜单项

| 行号 | 菜单名      | URL（`link` 字段）                                 | 可见性    | 需修改 | 说明                |
|------|-------------|--------------------------------------------------|-----------|--------|---------------------|
| 101  | Home        | `/`                                              | 仅移动端  | 否     | —                   |
| 111  | Apps        | `/use-cases`                                     | PC+移动端 | **是** | → `/app`            |
| 119  | Explore     | `/explore`                                       | 仅移动端  | 否     | —                   |
| 131  | Video AI    | 无 link（展开子列表）                              | PC+移动端 | 否     | —                   |
| 265  | Image AI    | 无 link（展开子列表）                              | PC+移动端 | 否     | —                   |
| 319  | AI Agent    | `isSignIn ? '/app/ai-agent' : '/ai-video-agent'` | 仅移动端  | **是** | → `/ai-agent`（统一） |
| 331  | Pro Effects | `/video-effects`                                 | 仅移动端  | 否     | ~~原记录 `/app/pro-effects` 有误，实际代码为 `/video-effects`~~ |
| 340  | Effects     | 无 link（展开子列表）                              | 仅移动端  | 否     | —                   |
| 734  | AI Tools    | 无 link（展开子列表）                              | PC+移动端 | 否     | —                   |
| 946  | Assets      | `/assets`                                        | 仅移动端  | 否     | —                   |
| 957  | API         | `/api-platform`                                  | PC+移动端 | 否     | —                   |
| 966  | Pricing     | `/pricing`                                       | PC+移动端 | 否     | —                   |

### 2.2 Video AI 子列表（`videoAiList`）

| 行号 | 名称                   | URL（`link` 字段）          | 移动端 inflow target         | 需修改 |
|------|------------------------|---------------------------|------------------------------|--------|
| 141  | Image to Video AI      | `/image-to-video`         | `IMAGE_TO_VIDEO`             | 否     |
| 155  | Text to Video AI       | `/text-to-video`          | `TEXT_TO_VIDEO`              | 否     |
| 171  | Reference to Video     | `/reference-to-video`     | `CONSISTENT_CHARACTER_VIDEO` | 否     |
| 188  | Video to Video AI      | `/video-to-video`         | `VIDEO_TO_VIDEO`             | 否     |
| 204  | AI Animation Generator | `/ai-animation-generator` | `AI_ANIMATION`               | 否     |
| 220  | Photo to Video Avatar  | `/ai-avatar`              | `AI_AVATAR`                  | 否     |
| 235  | AI Video Editor        | `/ai-video-editor`        | `AI_VIDEO_EDIT`              | 否     |
| 252  | AI Video Agent         | `/ai-video-agent`         | —（仅 PC 端）                  | 否     |

### 2.3 Image AI 子列表（`imageAiList`）

| 行号 | 名称               | URL（`link` 字段）      | 移动端 inflow target | 需修改 |
|------|--------------------|-----------------------|----------------------|--------|
| 274  | AI Image Generator | `/ai-image-generator` | `TEXT_TO_IMAGE`      | 否     |
| 290  | Image to Image AI  | `/image-to-image-ai`  | `IMAGE_TO_IMAGE`     | 否     |
| 306  | Chat to Image      | `/chat-to-image`      | —（`hidden: true`）    | 否     |

### 2.4 Effects → Video Effects `groupTab`

| 行号 | 名称                             | URL（`link` 字段）                                 | 移动端 inflow code                | 需修改                        |
|------|----------------------------------|--------------------------------------------------|-----------------------------------|-------------------------------|
| —    | **groupHref**                    | `/video-effects`                                 | —                                 | 否                            |
| —    | **signInGroupHref**              | `/app/video-effects`                             | —                                 | **是**（移除，统一用 groupHref） |
| 359  | AI Kissing Video Generator       | `/video-effects/ai-kissing`                      | `ai-kissing`                      | 否                            |
| 374  | AI Hug Generator                 | `/video-effects/ai-hug`                          | `ai-hug`                          | 否                            |
| 390  | AI Twerk Generator               | `/video-effects/ai-twerk-video-generator`        | `ai-twerk-video-generator`        | 否                            |
| 405  | Earth Zoom In                    | `/video-effects/earth-zoom-in`                   | `earth-zoom-in`                   | 否                            |
| 420  | AI Bikini Generator              | `/video-effects/ai-bikini`                       | `ai-bikini`                       | 否                            |
| 435  | Into The Mouth                   | `/video-effects/into-the-mouth`                  | `into-the-mouth`                  | 否                            |
| 450  | AI Jiggle Video Effect           | `/video-effects/ai-jiggle-video-effect`          | `ai-jiggle-video-effect`          | 否                            |
| 465  | Action Figure                    | `/video-effects/action-figure`                   | `action-figure`                   | 否                            |
| 480  | AI Muscle Generator              | `/video-effects/ai-muscle-generator`             | `ai-muscle-generator`             | 否                            |
| 495  | AI French Kiss Video Generator   | `/video-effects/ai-french-kiss-video-generator`  | `ai-french-kiss-video-generator`  | 否                            |
| 510  | AI Fake Date Video Generator     | `/video-effects/ai-fake-date-video-generator`    | `ai-fake-date-video-generator`    | 否                            |
| 525  | AI 360° Rotation Video Generator | `/video-effects/ai-360-rotation-video-generator` | `ai-360-rotation-video-generator` | 否                            |

### 2.5 Effects → Image Effects `groupTab`

| 行号 | 名称                                 | URL（`link` 字段）                                      | 移动端 inflow code                     | 需修改                        |
|------|--------------------------------------|-------------------------------------------------------|----------------------------------------|-------------------------------|
| —    | **groupHref**                        | `/photo-effects`                                      | —                                      | 否                            |
| —    | **signInGroupHref**                  | `/app/photo-effects`                                  | —                                      | **是**（移除，统一用 groupHref） |
| 552  | AI Selfie with Celebrities Generator | `/photo-effects/ai-selfie-with-celebrities-generator` | `ai-selfie-with-celebrities-generator` | 否                            |
| 567  | Polaroid Duo Selfie                  | `/photo-effects/polaroid-duo-selfie`                  | `polaroid-duo-selfie`                  | 否                            |
| 582  | Pregnant AI                          | `/photo-effects/pregnant-ai`                          | `pregnant-ai`                          | 否                            |
| 597  | AI Polaroid Maker                    | `/photo-effects/ai-polaroid-maker`                    | `ai-polaroid-maker`                    | 否                            |
| 612  | AI Action Figure Generator           | `/photo-effects/ai-action-figure-generator`           | `ai-action-figure-generator`           | 否                            |
| 627  | AI Fat Filter                        | `/photo-effects/ai-fat-filter`                        | `ai-fat-filter`                        | 否                            |
| 642  | Ghibli AI Generator                  | `/photo-effects/ghibli-ai`                            | `ghibli-ai`                            | 否                            |
| 657  | AI Beardless Filter                  | `/photo-effects/ai-beardless-filter`                  | `ai-beardless-filter`                  | 否                            |
| 672  | AI Simpsons Character Generator      | `/photo-effects/ai-simpsons-character-generator`      | `ai-simpsons-character-generator`      | 否                            |
| 687  | Pixar AI Generator                   | `/photo-effects/pixar-ai-generator`                   | `pixar-ai-generator`                   | 否                            |
| 702  | AI Caricature Maker                  | `/photo-effects/ai-caricature-maker`                  | `ai-caricature-maker`                  | 否                            |
| 717  | AI Baby filter                       | `/photo-effects/ai-baby-filter`                       | `ai-baby-filter`                       | 否                            |

### 2.6 AI Tools → Video Tools `groupTab`

| 行号 | 名称                 | URL（`link` 字段）        | 移动端 inflow code     | 需修改            |
|------|----------------------|-------------------------|------------------------|-------------------|
| —    | **groupHref**        | `/tool`                 | —                      | **是** → `/tools` |
| 753  | AI Video Upscaler    | `/video-upscaler`       | `video-upscaler`       | 否                |
| 768  | AI Video Enhancer    | `/video-enhancer`       | `video-enhancer`       | 否                |
| 783  | Video to Anime       | `/video-to-anime-ai`    | `video-to-anime-ai`    | 否                |
| 798  | AI Video Filters     | `/ai-video-filters`     | `ai-video-filters`     | 否                |
| 813  | AI Dance Generator   | `/ai-dance-generator`   | `ai-dance-generator`   | 否                |
| 828  | Anime Video Enhancer | `/anime-video-enhancer` | `anime-video-enhancer` | 否                |

### 2.7 AI Tools → Image Tools `groupTab`

| 行号 | 名称                | URL（`link` 字段）           | 移动端 inflow code                   | 需修改 |
|------|---------------------|----------------------------|--------------------------------------|--------|
| —    | **groupHref**       | `/image-tools`             | —                                    | 否     |
| 853  | Remove BG           | `/background-remover`      | `background-remover`                 | 否     |
| 869  | Object Remover      | `/object-remover`          | `object-remover`                     | 否     |
| 884  | Image Enhancer      | `/image-enhancer`          | `image-enhancer`                     | 否     |
| 898  | Ghibli AI Generator | `/photo-effects/ghibli-ai` | `ghibli-ai`（target: `PHOTO_EFFECTS`） | 否     |
| 913  | Anime Upscaler      | `/anime-upscaler`          | `anime-upscaler`                     | 否     |
| 929  | Image Generators    | `/image-generators`        | `image-generators`                   | 否     |

---

## 3. HeaderList/AiList/data.tsx（模型数据源）

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/AiList/data.tsx`

### 3.1 Image Models（`useImageModelData`）

| 行号 | 名称             | URL（`href` 字段）           | 需修改 |
|------|------------------|----------------------------|--------|
| 16   | Nano Banana      | `/im/nano-banana`          | 否     |
| 20   | Recraft          | `/im/recraft`              | 否     |
| 21   | Ideogram         | `/im/ideogram`             | 否     |
| 23   | Stable Diffusion | `/im/stable-diffusion`     | 否     |
| 27   | FLUX             | `/im/flux-ai`              | 否     |
| 30   | Seedream         | `/im/seedream`             | 否     |
| 34   | Dall-E           | `/im/dall-e`               | 否     |
| 35   | Imagen           | `/im/imagen`               | 否     |
| 36   | GPT-4o           | `/im/gpt-4o`               | 否     |
| 39   | Flux Kontext     | `/im/flux-ai/flux-kontext` | 否     |
| 43   | Qwen Image       | `/im/qwen-image`           | 否     |
| 47   | Wan AI           | `/im/wan-ai`               | 否     |

### 3.2 Video Models（`useVideoModelData`）

| 行号 | 名称        | URL（`href` 字段） | 需修改 |
|------|-------------|------------------|--------|
| 56   | Pollo 2.5   | `/m/pollo-ai`    | 否     |
| 68   | Veo 3       | `/m/veo/veo-3`   | 否     |
| 72   | Sora 2      | `/m/sora/sora-2` | 否     |
| 73   | Kling AI    | `/m/kling-ai`    | 否     |
| 74   | Hailuo AI   | `/m/hailuo-ai`   | 否     |
| 77   | PixVerse AI | `/m/pixverse-ai` | 否     |
| 80   | Runway      | `/m/runway-ai`   | 否     |
| 81   | Vidu AI     | `/m/vidu-ai`     | 否     |
| 82   | Luma AI     | `/m/luma-ai`     | 否     |
| 83   | Pika AI     | `/m/pika-ai`     | 否     |
| 85   | Seedance    | `/m/seedance`    | 否     |
| 86   | Wan AI      | `/m/wan-ai`      | 否     |
| 87   | Hunyuan     | `/m/hunyuan`     | 否     |

---

## 4. HeaderList/AiList/index.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/AiList/index.tsx`

| 行号 | 组件           | URL            | 说明                                           | 需修改     |
|------|----------------|----------------|------------------------------------------------|------------|
| 66   | `<InFlowLink>` | `subItem.link` | 动态，来自 menu.tsx `videoAiList`/`imageAiList` | 否（渲染层） |
| 90   | `<ModelTag>`   | `a.href`       | 动态，来自 data.tsx                             | 否（渲染层） |

---

## 5. HeaderList/AiList/MobileAiList.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/AiList/MobileAiList.tsx`

| 行号 | 组件           | URL         | 说明                                           | 需修改     |
|------|----------------|-------------|------------------------------------------------|------------|
| 83   | `<InFlowLink>` | `item.link` | 动态，来自 menu.tsx `videoAiList`/`imageAiList` | 否（渲染层） |
| 110  | `<ModelTag>`   | `a.href`    | 动态，来自 data.tsx                             | 否（渲染层） |

---

## 6. HeaderList/GroupList/index.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/GroupList/index.tsx`

| 行号 | 组件           | URL                 | 说明                                 | 需修改                       |
|------|----------------|---------------------|--------------------------------------|------------------------------|
| 63   | `<InFlowLink>` | `tool.link`         | 动态，来自 menu.tsx `groupTab[].list` | 否（渲染层）                   |
| 74   | `<Link>`       | `subItem.groupHref` | "View More"，直接使用 groupHref       | 否（渲染层，数据源在 menu.tsx） |

---

## 7. HeaderList/GroupList/MobileGroupList.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/GroupList/MobileGroupList.tsx`

| 行号  | 组件           | URL                                                                        | 说明                                     | 需修改                                                 |
|-------|----------------|----------------------------------------------------------------------------|------------------------------------------|--------------------------------------------------------|
| 73    | `<InFlowLink>` | `tool.link`                                                                | 动态，来自 menu.tsx `groupTab[].list`     | 否（渲染层）                                             |
| 84-88 | `<Link>`       | `isSignIn && item.signInGroupHref ? item.signInGroupHref : item.groupHref` | "View More"，登录态优先 `signInGroupHref` | **是**（移除 signInGroupHref 分支逻辑，统一用 groupHref） |

---

## 8. HeaderList/BasicList.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/BasicList.tsx`

| 行号 | 组件           | URL            | 说明                          | 需修改     |
|------|----------------|----------------|-------------------------------|------------|
| 19   | `<InFlowLink>` | `subItem.href` | 动态，由父组件传入 `list` prop | 否（渲染层） |

---

## 9. HeaderList/TemplatesList/index.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/TemplatesList/index.tsx`

| 行号 | 组件           | URL              | 说明                        | 需修改     |
|------|----------------|------------------|-----------------------------|------------|
| 35   | `<InFlowLink>` | `subItem.link`   | 动态，`templateList` 前 3 项 | 否（渲染层） |
| 48   | `<Link>`       | `subItem.link`   | 动态，第 4-7 项              | 否（渲染层） |
| 60   | `<Link>`       | `subItem.link`   | 动态，第 8+ 项               | 否（渲染层） |
| 71   | `<Link>`       | `/video-effects` | 固定，"View More"            | 否         |

---

## 10. HeaderList/TemplatesList/MobileTemplatesList.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/TemplatesList/MobileTemplatesList.tsx`

| 行号 | 组件           | URL              | 说明                | 需修改     |
|------|----------------|------------------|---------------------|------------|
| 44   | `<InFlowLink>` | `item.link`      | 动态，`templateList` | 否（渲染层） |
| 55   | `<Link>`       | `/video-effects` | 固定，"View More"    | 否         |

---

## 11. HeaderList/PhotoEffectsList/index.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/PhotoEffectsList/index.tsx`

| 行号 | 组件           | URL              | 说明             | 需修改     |
|------|----------------|------------------|------------------|------------|
| 35   | `<InFlowLink>` | `subItem.link`   | 动态，前 3 项     | 否（渲染层） |
| 49   | `<InFlowLink>` | `subItem.link`   | 动态，第 4-7 项   | 否（渲染层） |
| 61   | `<InFlowLink>` | `subItem.link`   | 动态，第 8+ 项    | 否（渲染层） |
| 73   | `<Link>`       | `/photo-effects` | 固定，"View More" | 否         |

---

## 12. HeaderList/PhotoEffectsList/MobilePhotoEffectsList.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/PhotoEffectsList/MobilePhotoEffectsList.tsx`

| 行号 | 组件     | URL              | 说明                    | 需修改     |
|------|----------|------------------|-------------------------|------------|
| 44   | `<Link>` | `item.link`      | 动态，`photoEffectsList` | 否（渲染层） |
| 54   | `<Link>` | `/photo-effects` | 固定，"View More"        | 否         |

---

## 13. HeaderList/components/ModelTag.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/components/ModelTag.tsx`

| 行号 | 组件     | URL         | 说明               | 需修改     |
|------|----------|-------------|--------------------|------------|
| 30   | `<Link>` | `href` prop | 动态，来自 data.tsx | 否（渲染层） |

---

## 14. HeaderList/LocalesList/index.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderList/LocalesList/index.tsx`

| 行号 | 组件     | URL                             | 说明     | 需修改 |
|------|----------|---------------------------------|----------|--------|
| 58   | `<Link>` | `/{locale}{pathname}`（动态拼接） | 语言切换 | 否     |

---

## 15. HeaderMenu/_block/PCMenu/index.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderMenu/_block/PCMenu/index.tsx`

| 行号 | 组件          | URL                                         | 说明                      | 需修改                       |
|------|---------------|---------------------------------------------|---------------------------|------------------------------|
| 33   | `<Link>`      | `item.link`                                 | 动态，一级菜单 `link` 字段 | 否（渲染层，数据源在 menu.tsx） |
| 54   | `<AiList>`    | `item.videoAiList[].link`                   | 动态，Video AI 子列表      | 否（渲染层）                   |
| 75   | `<GroupList>` | `item.groupTab[].list[].link` + `groupHref` | 动态，分组列表             | 否（渲染层）                   |
| 94   | `<AiList>`    | `item.imageAiList[].link`                   | 动态，Image AI 子列表      | 否（渲染层）                   |

---

## 16. HeaderMenu/_block/MobileMenu/index.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/HeaderMenu/_block/MobileMenu/index.tsx`

| 行号 | 组件                | URL                       | 说明                      | 需修改                                 |
|------|---------------------|---------------------------|---------------------------|----------------------------------------|
| 72   | `<Link>`            | `item.link`               | 动态，一级菜单 `link` 字段 | 否（渲染层，数据源在 menu.tsx）           |
| 88   | `<MobileAiList>`    | `item.videoAiList[].link` | 动态，Video AI 子列表      | 否（渲染层）                             |
| 100  | `<MobileGroupList>` | `item.groupTab` 数据      | 动态，分组列表             | 否（渲染层，但消费 signInGroupHref 逻辑） |
| 111  | `<MobileAiList>`    | `item.imageAiList[].link` | 动态，Image AI 子列表      | 否（渲染层）                             |

---

## 17. History/index.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/History/index.tsx`

| 行号 | 组件     | URL       | 说明                   | 需修改 |
|------|----------|-----------|------------------------|--------|
| 132  | `<Link>` | `/assets` | History 按钮跳转资产页 | 否     |

---

## 18. Pricing/index.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/Pricing/index.tsx`

| 行号 | 组件     | URL        | 说明         | 需修改 |
|------|----------|------------|--------------|--------|
| 7    | `<Link>` | `/pricing` | Pricing 链接 | 否     |

---

## 19. LoginUserInfo/index.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/LoginUserInfo/index.tsx`

| 行号 | 组件     | URL        | 说明       | 需修改 |
|------|----------|------------|------------|--------|
| 51   | `<Link>` | `/sign-in` | Login 按钮 | 否     |

---

## 20. StartForFree/index.tsx

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_layout/Header/StartForFree/index.tsx`

| 行号 | 组件     | URL        | 说明                | 需修改 |
|------|----------|------------|---------------------|--------|
| 44   | `<Link>` | `/sign-up` | Start for Free 按钮 | 否     |

---

## 21. app/_hooks/menu.tsx（用户中心菜单数据源）

`/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/_hooks/menu.tsx`

此文件通过 `useGetAccountMenuList()` 返回用户中心下拉菜单数据。

| 行号 | 菜单名         | URL（`url` 字段）                     | 可见条件        | 需修改 | 说明                 |
|------|----------------|-------------------------------------|-----------------|--------|----------------------|
| 52   | Assets         | `/assets`                           | 始终            | 否     | —                    |
| 60   | Pricing        | `/pricing`                          | `!plan.hasPlan` | 否     | —                    |
| 69   | Billing        | `/app/account/billing`              | `plan.hasPlan`  | **是** | → `/account/billing` |
| 92   | Refer a Friend | `/app/refer`                        | 始终（render）    | **是** | → `/refer`           |
| 114  | Profile        | `authorUrl`（动态，如 `/profile/xxx`） | `!!authorUrl`   | 否     | —                    |
| 123  | My Account     | `/settings`                         | 始终            | 否     | —                    |

---

## 变更汇总

| # | 文件                            | 当前 URL                                                                   | 目标 URL                  | 行号  |
|---|---------------------------------|----------------------------------------------------------------------------|---------------------------|-------|
| 1 | `HeaderMenu/menu.tsx`           | `/use-cases`                                                               | `/app`                    | 111   |
| 2 | `HeaderMenu/menu.tsx`           | `isSignIn ? '/app/ai-agent' : '/ai-video-agent'`                           | `/ai-agent`               | 319   |
| 3 | `HeaderMenu/menu.tsx`           | `signInGroupHref: '/app/video-effects'`                                    | 移除该字段                | ~353  |
| 4 | `HeaderMenu/menu.tsx`           | `signInGroupHref: '/app/photo-effects'`                                    | 移除该字段                | ~545  |
| 5 | `HeaderMenu/menu.tsx`           | `groupHref: '/tool'`                                                       | `/tools`                  | ~746  |
| 6 | `GroupList/MobileGroupList.tsx` | `isSignIn && item.signInGroupHref ? item.signInGroupHref : item.groupHref` | 统一使用 `item.groupHref` | 84-88 |
| 7 | `app/_hooks/menu.tsx`           | `/app/account/billing`                                                     | `/account/billing`        | 69    |
| 8 | `app/_hooks/menu.tsx`           | `/app/refer`                                                               | `/refer`                  | 92    |

---

## Header 变更 vs Rewrite 配置 Diff 对应关系分析

> 对比来源：
>
> - Header 变更：本文档「变更汇总」#1-#8
> - Rewrite Diff：`pollo.ai.ts` 当前分支 vs master

### 一、已匹配的变更（Header ↔ Rewrite 一一对应）

| # | Header 变更                                              | Rewrite 变更                                                                                            | 对应关系说明                                                                                  |
|---|----------------------------------------------------------|---------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| 1 | Apps 链接 `/use-cases` → `/app`                          | 删除 `/app/apps` → `/use-cases`；新增 `/app` → `/use-cases`                                              | Header 对外展示 `/app`，rewrite 将 `/app` 内部转发到 `/use-cases` 页面。**匹配**                |
| 2 | AI Agent 链接 → `/ai-agent`（统一）                        | 新增 `/ai-agent` → `/app/ai-agent`；新增 `/ai-agent/:path*` → `/app/ai-agent/:path*`                     | Header 对外展示 `/ai-agent`，rewrite 将其转发到实际页面 `/app/ai-agent`。**匹配**               |
| 3 | 移除 `signInGroupHref: '/app/video-effects'`             | 删除 `/app/video-effects` → `/template`；删除 `/app/video-effects/:path*` → `/template/:path*`           | Header 不再使用 `/app/video-effects`，rewrite 同步删除该路径。**匹配**                          |
| 4 | 移除 `signInGroupHref: '/app/photo-effects'`             | 删除 `/app/photo-effects` → `/photo-effects`；删除 `/app/photo-effects/:path*` → `/photo-effects/:path*` | Header 不再使用 `/app/photo-effects`，rewrite 同步删除该路径。**匹配**                          |
| 5 | Video Tools groupHref `/tool` → `/tools`                 | 删除 `/app/tool` → `/tool`；新增 `/tools` → `/tool`                                                      | Header 对外展示 `/tools`，rewrite 将 `/tools` 内部转发到 `/tool` 页面。**匹配**                 |
| 6 | MobileGroupList 移除 signInGroupHref 分支逻辑            | （无直接 rewrite 变更）                                                                                   | 这是 #3、#4 的代码层联动清理，signInGroupHref 字段移除后渲染逻辑需同步简化。**间接匹配**         |
| 7 | Billing 链接 `/app/account/billing` → `/account/billing` | 新增 `/account/billing` → `/app/account/billing`                                                        | Header 对外展示 `/account/billing`，rewrite 将其转发到实际页面 `/app/account/billing`。**匹配** |
| 8 | Refer 链接 `/app/refer` → `/refer`                       | 新增 `/refer` → `/app/refer`                                                                            | Header 对外展示 `/refer`，rewrite 将其转发到实际页面 `/app/refer`。**匹配**                     |

### 二、Rewrite Diff 中未被 Header 变更覆盖的项（仅 Rewrite 侧有变动）

| #  | Rewrite 变更                                          | Header 现状                                                       | 是否需要 Header 配合修改                                                                                                                                                                                                                                       |
|----|-------------------------------------------------------|-------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| R1 | 删除 `/app/tool` → `/tool`                            | Header 中无 `/app/tool` 链接                                      | **否**。Header 从未使用 `/app/tool`，此 rewrite 仅服务于直接访问场景，删除不影响 Header                                                                                                                                                                           |
| R2 | 删除 `/app/image-tools` → `/image-tools`              | Header groupHref 为 `/image-tools`（§2.7）                          | **否**。Header 使用的是 `/image-tools` 而非 `/app/image-tools`，不受影响                                                                                                                                                                                         |
| R3 | 删除 `/app/ai-video` → `/video-studio`                | Header 中无此链接                                                 | **否**。此路径不在 Header 导航中                                                                                                                                                                                                                                |
| R4 | 删除 `/app/ai-image` → `/image-studio`                | Header 中无此链接                                                 | **否**。此路径不在 Header 导航中                                                                                                                                                                                                                                |
| R5 | 删除 `/app/ai-avatar` → `/avatar-studio`              | Header 中无此链接                                                 | **否**。此路径不在 Header 导航中                                                                                                                                                                                                                                |
| R6 | 删除 `/app/pro-effects/:path*` → `/ai-effects/:path*` | Header Pro Effects 链接为 `/app/pro-effects`（§2.1 行331，仅移动端） | **⚠️ 存疑**。rewrite 删除了 `/app/pro-effects/:path*` 但保留了 `/pro-effects/:path*`。Header 仍链接到 `/app/pro-effects`，该路径不再有 rewrite 规则。需确认：(1) `/app/pro-effects` 是否有实际的 Next.js 页面可直接响应；(2) 或者 Header 是否也应改为 `/pro-effects` |

### 三、Header 变更中未被 Rewrite Diff 覆盖的项

**无。** Header 的 8 项变更均在 Rewrite Diff 中找到了对应的配置支撑。

### 四、结论

1. **Header 变更汇总 #1-#8 与 Rewrite Diff 完全对应**，修改方案可直接执行
2. **唯一存疑项**：`/app/pro-effects`（R6）—— Header 文档标记为「不需修改」，但对应的 rewrite 已被删除。建议确认该路径是否仍可访问，若不可访问则 Header 需追加变更：`/app/pro-effects` → `/pro-effects`

---

## 基于需求文档的二次校验

> 对比来源：Pollo 2.0 产品框架改版需求文档

### 一、已有变更的正确性校验

| # | Header 变更                                         | 需求文档依据                                                                                              | 是否正确 |
|---|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------|----------|
| 1 | Apps `/use-cases` → `/app`                          | §5.6 apps聚合页面：将 apps/use-cases/tools 合并到 `/app`；§4.2 信息流：`app/apps` 需 301 到 `/app`           | ✅ 正确   |
| 2 | AI Agent → `/ai-agent`（统一）                        | §5.1.1 左侧导航栏：AI Agent 在 Apps 分类下；URL 模式 `/app/app功能名`，rewrite `/ai-agent` → `/app/ai-agent` | ✅ 正确   |
| 3 | 移除 `signInGroupHref: '/app/video-effects'`        | §4.2 路由重定向：`/app/video-effects` → `/video-effects`；§5.7 effects 合并到统一入口                       | ✅ 正确   |
| 4 | 移除 `signInGroupHref: '/app/photo-effects'`        | §4.2 路由重定向：`/app/photo-effects` → `/photo-effects`                                                   | ✅ 正确   |
| 5 | Video Tools groupHref `/tool` → `/tools`            | §4.2 路由重定向：`/app/tool` → `/tools`                                                                    | ✅ 正确   |
| 6 | MobileGroupList 移除 signInGroupHref 分支逻辑       | #3、#4 的联动清理                                                                                          | ✅ 正确   |
| 7 | Billing `/app/account/billing` → `/account/billing` | §5.1.2 顶部信息栏：billing `/account/billing`，标注「有变更，原来是 /app/account/billing」                     | ✅ 正确   |
| 8 | Refer `/app/refer` → `/refer`                       | §5.1.2 顶部信息栏：Refer `/refer`，标注「有变更，原来是 app/refer」                                            | ✅ 正确   |

**结论：现有 8 项变更均正确，与需求文档一致。**

### 二、需求文档中存在但变更汇总中遗漏的项

| #  | 需求文档要求                                                                        | 涉及文件                          | 遗漏的变更                                                                                                                                                                    | 优先级                       |
|----|-------------------------------------------------------------------------------------|-----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| M1 | §5.1.5「去掉 history」                                                                | `Header/History/index.tsx`（§17）   | History 组件应整体移除（当前行132 的 `/assets` 链接及整个入口）。变更汇总未涉及                                                                                                  | **高**                       |
| M2 | §5.1.2 logo「有，去掉了左上角的导航入口」                                              | `Header/index.tsx`（§1）            | Logo 区域需去掉左侧导航入口（可能是 hamburger 菜单/sidebar toggle），当前标记为「不需修改」                                                                                        | **中**（需确认具体指哪个元素） |
| M3 | §5.1.1 左侧导航栏 Apps 下包含 Video tools `/video-tools`、Image tools `/image-tools` | `HeaderMenu/menu.tsx`（§2.6、§2.7）  | 需求文档的视频工具聚合页 URL 为 `/video-tools`，但 Header 变更 #5 目标是 `/tools`。两者不同，需确认：`/tools` 是 Header 导航的入口 URL，还是应改为 `/video-tools` 与左侧导航栏一致 | **中**（需确认）               |
| M4 | §5.7 effects 聚合：pro effects 合并到 effects 页面                                   | `HeaderMenu/menu.tsx`（§2.1 行331） | Pro Effects 链接 `/app/pro-effects` 的 rewrite 已删除（R6），且需求文档中 effects 已合并。Header 移动端的 Pro Effects 入口可能需要调整为 `/pro-effects` 或直接移除                | **中**                       |
| M5 | §5.1.4 消息提醒 toast 替代 history                                                  | Header 框架层                     | 需在 Header 右上角新增消息提醒 toast（生成完成/失败通知，3s 消失，点击跳转 generate）。这是新增功能，不属于 URL 变更，但属于 Header 改造范围                                         | **低**（独立功能，非 URL 变更） |
M1 M2 M5 不考虑

**M3 结论：可忽略。** 需求文档 §5.1.1 左侧导航栏定义的 `/video-tools` 与 Header 变更 #5 的 `/tools` 不冲突——`/tools` 是顶部导航栏入口（`menu.tsx:746` `groupHref: '/tool'` → `/tools`），`/video-tools` 是 `/app` 聚合页内的 tab 分类，属于不同层级。

**M4 结论：无需修改。** 实际代码 `menu.tsx:329-338` 中 Pro Effects 的 link 已经是 `/video-effects`（非 `/app/pro-effects`），与 rewrite 删除 `/app/pro-effects` 不冲突。§2.1 行331 的记录有误，需更正。
