## 顶部导航栏（Header/index.tsx）一级子项（展示名称 + 组件名）

| 展示名称       | 组件名称                            | 展示条件/说明                                               |
| -------------- | ----------------------------------- | ----------------------------------------------------------- |
| 顶部通知横幅   | TopBanners                          | idleMounted 为 true 时展示                                  |
| 顶部活动弹窗   | PromotionPopups                     | idleMounted 为 true 时展示                                  |
| 左上角导航入口 | WorkspaceHeader.LeftMenu            | isCompactMenu 为 true 时展示                                |
| 移动端菜单按钮 | Header 内部移动端 icon 按钮         | xl 以下可见（通过样式控制）                                 |
| Logo           | Link（含 logo span）                | 常驻展示                                                    |
| 中间广告位     | Advertisement                       | showAdvertisement && !isActivePromotion                     |
| 中间促销横幅   | Header 内促销 banner 区块（inline） | showAdvertisement && isActivePromotion                      |
| 主导航菜单     | HeaderMenu                          | 常驻挂载（内部再按 showHeaderMenu 控制）                    |
| 项目下拉       | ProjectDropdown                     | showLoginUserInfo && isSignIn                               |
| 历史记录       | History                             | showLoginUserInfo && isSignIn                               |
| 积分信息       | CreditsInfo                         | showLoginUserInfo && showCreditsInfo                        |
| 关注领积分     | FollowClaimCredits                  | showLoginUserInfo && showCreditsInfo && canShowClaimCredits |
| 消息抽屉       | MessageDrawer                       | showLoginUserInfo && isSignIn                               |
| 登录/用户入口  | LoginUserInfo                       | showLoginUserInfo                                           |
| Start for Free | StartForFree                        | showLoginUserInfo（未登录态样式生效）                       |

---

按当前代码实际渲染，三块菜单的“每一个展示项”如下。

**PCMenu（桌面端导航）**

动态子链说明：Video AI/Image AI 下方还有模型动态子链（Supported Models），这部分不是 menu.tsx 固定菜单项，而是运行时按数据列表循环渲染。
引入代码位置：web/src/pages/pollo.ai/\_layout/Header/HeaderList/AiList/index.tsx:29-33,82-94；web/src/pages/pollo.ai/\_layout/Header/HeaderList/AiList/data.tsx:11-54,56-104。

顶层展示项（8个）：

| 展示项   | 类型     | 跳转/展开                 |
| -------- | -------- | ------------------------- |
| Home     | 直链     | `/`                       |
| Apps     | 直链     | `/use-cases`              |
| Video AI | 下拉     | 展开 8 个子项             |
| Image AI | 下拉     | 展开 2 个子项             |
| Effects  | 下拉分组 | 2 个分组 + 各自 View More |
| AI Tools | 下拉分组 | 2 个分组 + 各自 View More |
| API      | 直链     | `/api-platform`           |
| Pricing  | 直链     | `/pricing`                |

未在 PCMenu 展示：`Explore`、`Pro Effects`、`Assets`（它们是移动端项）。

Video AI 子项（8个）：

1. Image to Video AI → `/image-to-video`
2. Text to Video AI → `/text-to-video`
3. Reference to Video → `/reference-to-video`
4. Video to Video AI → `/video-to-video`
5. AI Animation Generator → `/ai-animation-generator`
6. Photo to Video Avatar → `/ai-avatar`
7. AI Video Editor → `/ai-video-editor`
8. AI Video Agent（Beta）→ `/ai-video-agent`

Image AI 子项（2个）：

1. AI Image Generator → `/ai-image-generator`
2. Image to Image AI → `/image-to-image-ai`
3. `Chat to Image` 在数据里但被 hidden 过滤，不展示

Effects 分组：

1. Video Effects（View More → `/video-effects`）
    1. AI Kissing Video Generator → `/video-effects/ai-kissing`
    2. AI Hug Generator → `/video-effects/ai-hug`
    3. AI Twerk Generator → `/video-effects/ai-twerk-video-generator`
    4. Earth Zoom In → `/video-effects/earth-zoom-in`
    5. AI Bikini Generator → `/video-effects/ai-bikini`
    6. Into The Mouth → `/video-effects/into-the-mouth`
    7. AI Jiggle Video Effect → `/video-effects/ai-jiggle-video-effect`
    8. Action Figure → `/video-effects/action-figure`
    9. AI Muscle Generator → `/video-effects/ai-muscle-generator`
    10. AI French Kiss Video Generator → `/video-effects/ai-french-kiss-video-generator`
    11. AI Fake Date Video Generator → `/video-effects/ai-fake-date-video-generator`
    12. AI 360° Rotation Video Generator → `/video-effects/ai-360-rotation-video-generator`
2. Image Effects（View More → `/photo-effects`）
    1. AI Selfie with Celebrities Generator → `/photo-effects/ai-selfie-with-celebrities-generator`
    2. Polaroid Duo Selfie → `/photo-effects/polaroid-duo-selfie`
    3. Pregnant AI → `/photo-effects/pregnant-ai`
    4. AI Polaroid Maker → `/photo-effects/ai-polaroid-maker`
    5. AI Action Figure Generator → `/photo-effects/ai-action-figure-generator`
    6. AI Fat Filter → `/photo-effects/ai-fat-filter`
    7. Ghibli AI Generator → `/photo-effects/ghibli-ai`
    8. AI Beardless Filter → `/photo-effects/ai-beardless-filter`
    9. AI Simpsons Character Generator → `/photo-effects/ai-simpsons-character-generator`
    10. Pixar AI Generator → `/photo-effects/pixar-ai-generator`
    11. AI Caricature Maker → `/photo-effects/ai-caricature-maker`
    12. AI Baby filter → `/photo-effects/ai-baby-filter`

AI Tools 分组：

1. Video Tools（View More → `/tool`）
    1. AI Video Upscaler → `/video-upscaler`
    2. AI Video Enhancer → `/video-enhancer`
    3. Video to Anime → `/video-to-anime-ai`
    4. AI Video Filters → `/ai-video-filters`
    5. AI Dance Generator → `/ai-dance-generator`
    6. Anime Video Enhancer → `/anime-video-enhancer`
2. Image Tools（View More → `/image-tools`）
    1. Remove BG → `/background-remover`
    2. Object Remover → `/object-remover`
    3. Image Enhancer → `/image-enhancer`
    4. Ghibli AI Generator → `/photo-effects/ghibli-ai`
    5. Anime Upscaler → `/anime-upscaler`
    6. Image Generators → `/image-generators`

**MobileMenu（移动端导航）**

动态子链说明：移动端同样会在 AI 菜单内渲染模型动态子链（未登录时显示）；此外 Effects/AI Tools 的 View More 会按登录态在 groupHref 与 signInGroupHref 间切换。
引入代码位置：web/src/pages/pollo.ai/\_layout/Header/HeaderList/AiList/MobileAiList.tsx:30-33,105-121；web/src/pages/pollo.ai/\_layout/Header/HeaderList/GroupList/MobileGroupList.tsx:86-92。

顶层展示项（11个）：

1. Home → `/`
2. Apps → `/use-cases`
3. Explore → `/explore`
4. Video AI（展开 8 子项，同 PC）
5. Image AI（展开 2 子项，同 PC）
6. Pro Effects → `/app/pro-effects`
7. Effects（展开 2 分组、各 12 子项）
8. AI Tools（展开 2 分组、各 6 子项）
9. Assets → `/assets`
10. API → `/api-platform`
11. Pricing → `/pricing`

移动端与 PC 的关键差异：

1. 多了：`Explore`、`Pro Effects`、`Assets`
2. Effects 的 View More 登录后会优先走 `signInGroupHref`：
    1. Video Effects：`/app/video-effects`
    2. Image Effects：`/app/photo-effects`
3. AiList 在移动端会显示“Image Models / Video Models”模型标签区（未登录时显示）

**HeaderActions（头像下拉菜单）**

动态子链说明：菜单项会按订阅状态、作者页存在与否、积分资格动态过滤；Language 子链按 locales 动态生成；Management 跳转目标按权限动态计算。
引入代码位置：web/src/pages/pollo.ai/app/\_hooks/menu.tsx:32-122；web/src/pages/pollo.ai/app/\_components/LanguageTab/index.tsx:21-27,47-73,91-116；web/src/\_blocks/Managements/\_components/Menus/WebMenuEntry/index.tsx:17-33。

展示项（按渲染顺序）：

| 展示项         | 类型        | 跳转/动作                         | 展示条件                     |
| -------------- | ----------- | --------------------------------- | ---------------------------- |
| Language       | 折叠/子菜单 | 切换当前 URL 语言前缀             | 总是                         |
| Assets         | 直链        | `/assets`                         | 总是                         |
| Pricing        | 直链        | `/pricing`                        | `无订阅` 才显示              |
| Billing        | 直链        | `/app/account/billing`            | `有订阅` 才显示              |
| Credits        | 自定义项    | 领积分入口                        | `canShowClaimCredits` 才显示 |
| Refer a Friend | 自定义项    | `/app/refer`                      | 总是                         |
| Contact Us     | 自定义项    | `mailto:supportEmail` + Copy 按钮 | 总是                         |
| Profile        | 直链        | `authorUrl`                       | `authorUrl` 存在才显示       |
| My Account     | 直链        | `/settings`                       | 总是                         |
| Management     | 条件入口    | 跳转管理后台首个可访问菜单        | `debug 权限` 且桌面端        |
| Logout         | 动作        | 退出登录                          | 总是（已登录态下）           |

如果你要，我可以下一步给你一份“产品文档可直接粘贴版”（只保留名称、URL、条件三列，不带代码术语）。

---

## 产品评审版（精简）

### 评审范围

- 顶部导航栏（Header 一级子项）
- 导航三块菜单：PCMenu、MobileMenu、HeaderActions

### 顶部导航栏一级子项（评审清单）

| 展示项         | 组件                     | 跳转                     | 展示条件                                                    |
| -------------- | ------------------------ | ------------------------ | ----------------------------------------------------------- |
| 顶部通知横幅   | TopBanners               | 无                       | idleMounted                                                 |
| 顶部活动弹窗   | PromotionPopups          | 无                       | idleMounted                                                 |
| 左上角导航入口 | WorkspaceHeader.LeftMenu | 无                       | isCompactMenu                                               |
| 移动端菜单按钮 | Header 内部按钮          | 无                       | xl 以下                                                     |
| Logo           | Link                     | `/`                      | 常驻                                                        |
| 中间广告位     | Advertisement            | 广告目标页               | showAdvertisement && !isActivePromotion                     |
| 中间促销横幅   | 促销 banner 区块         | bannerLink 或 `/pricing` | showAdvertisement && isActivePromotion                      |
| 主导航菜单     | HeaderMenu               | 见 PCMenu/MobileMenu     | 常驻挂载                                                    |
| 项目下拉       | ProjectDropdown          | 项目详情/切换            | showLoginUserInfo && isSignIn                               |
| 历史记录       | History                  | 历史弹层/页              | showLoginUserInfo && isSignIn                               |
| 积分信息       | CreditsInfo              | 计费/积分相关入口        | showLoginUserInfo && showCreditsInfo                        |
| 关注领积分     | FollowClaimCredits       | 活动入口                 | showLoginUserInfo && showCreditsInfo && canShowClaimCredits |
| 消息抽屉       | MessageDrawer            | 消息中心                 | showLoginUserInfo && isSignIn                               |
| 登录/用户入口  | LoginUserInfo            | 登录或用户菜单           | showLoginUserInfo                                           |
| Start for Free | StartForFree             | 注册/付费入口            | showLoginUserInfo（未登录态）                               |

### PCMenu（桌面）

| 顶层项   | 类型     | 跳转/展开            |
| -------- | -------- | -------------------- |
| Home     | 直链     | `/`                  |
| Apps     | 直链     | `/use-cases`         |
| Video AI | 下拉     | 8 子项               |
| Image AI | 下拉     | 2 子项               |
| Effects  | 下拉分组 | 2 分组（各 12 子项） |
| AI Tools | 下拉分组 | 2 分组（各 6 子项）  |
| API      | 直链     | `/api-platform`      |
| Pricing  | 直链     | `/pricing`           |

### MobileMenu（移动）

| 仅移动端新增顶层项 | 跳转               |
| ------------------ | ------------------ |
| Explore            | `/explore`         |
| Pro Effects        | `/app/pro-effects` |
| Assets             | `/assets`          |

其余与 PCMenu 同源；`Effects` 的 View More 登录后优先跳 `/app/video-effects` 与 `/app/photo-effects`。

### HeaderActions（头像下拉）

| 展示项         | 跳转/动作                    | 展示条件            |
| -------------- | ---------------------------- | ------------------- |
| Language       | 语言子链（按当前 URL 生成）  | 总是                |
| Assets         | `/assets`                    | 总是                |
| Pricing        | `/pricing`                   | 无订阅              |
| Billing        | `/app/account/billing`       | 有订阅              |
| Credits        | 领积分入口                   | canShowClaimCredits |
| Refer a Friend | `/app/refer`                 | 总是                |
| Contact Us     | `mailto:supportEmail` + 复制 | 总是                |
| Profile        | `authorUrl`                  | authorUrl 存在      |
| My Account     | `/settings`                  | 总是                |
| Management     | 权限路由动态计算后跳转       | debug 权限且桌面端  |
| Logout         | 退出登录                     | 总是（已登录态）    |

### 评审关注的动态子链（结论）

- 三块菜单的固定链接已完整梳理；动态子链主要来自模型列表、语言列表和管理后台权限路由。
- 评审时建议将“固定导航项”和“动态子链来源”分开验收，避免把运行时策略项误判为漏链。
