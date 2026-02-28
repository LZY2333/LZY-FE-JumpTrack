# 导航栏 Home & Effects 出现的 URL 及引用链路分析

> 分析对象：顶部导航栏中的 **Home** 和 **Effects** 两个菜单项
> 代码库：`web/src/pages/pollo.ai/`

---

## 一、引用链路

### 完整调用链

```
menu.tsx (useHeaderMenu hook)          ← 菜单数据定义层
  ↓ 调用
PCMenu/index.tsx                       ← 桌面端渲染（xl 及以上断点）
MobileMenu/index.tsx                   ← 移动端渲染（xl 以下断点）
  ↓ 被引用
HeaderMenu/index.tsx                   ← 菜单容器（控制 showHeaderMenu 的 xl:hidden）
  ↓ 被引用
Header/index.tsx                       ← 导航栏主体
  ↓ 被引用
_layout/index.tsx (DefaultLayout)      ← 页面布局层（控制 Header 是否渲染）
  ↓ 被引用
各页面 *.page.tsx                       ← 通过 withLayouts HOC 配置 headerProps
```

---

### Home 菜单项引用链路

```
menu.tsx:98
  name: t`Home`, link: '/', isDarkColor: true
    ↓
PCMenu/index.tsx:28-39
  item.link 分支 → 渲染 <Link href="/" />
    ↓
MobileMenu/index.tsx
  渲染带图标的移动端菜单项（mobileMenuIcon: 'before:i-cus--pol-home'）
    ↓
HeaderMenu/index.tsx:40
  className={cls`${showHeaderMenu ? '' : 'xl:hidden'}`}
  // showHeaderMenu=false 时桌面端整体隐藏，移动端不受影响
    ↓
Header/index.tsx:228-234
  <HeaderMenu showHeaderMenu={showHeaderMenu} ... />
    ↓
DefaultLayout (_layout/index.tsx:122-149)
  {headerProps !== false && !mainOnly ? <Header {...headerProps} /> : null}
```

---

### Effects 菜单项引用链路

```
menu.tsx:324-714
  name: t`Effects`, groupTab: [
    { label: 'Video Effects', groupHref: '/video-effects', list: [...12个子项] },
    { label: 'Image Effects', groupHref: '/photo-effects', list: [...12个子项] },
  ]
    ↓
PCMenu/index.tsx:61-81
  item.groupTab 分支 → 渲染下拉菜单容器 <GroupList groupTab={...} />
    ↓
MobileMenu/index.tsx
  渲染展开式移动端菜单（mobileMenuIcon: 'before:i-cus--pol-video-effect'）
    ↓
HeaderMenu/index.tsx:40（同 Home，受 showHeaderMenu 控制）
    ↓
Header/index.tsx → DefaultLayout（同上）
```

---

## 二、桌面端可见性控制逻辑

```
showHeaderMenu 默认值: true（Header/index.tsx:44）

HeaderMenu/index.tsx:40:
  className={cls`${showHeaderMenu ? '' : 'xl:hidden'}`}
  // false → 桌面端（xl+）隐藏 PCMenu 容器
  // 注意：MobileMenu 的汉堡菜单图标不受此影响，移动端始终可访问

PCMenu/index.tsx:26:
  className="hidden items-center xl:flex xl:gap-6 2xl:gap-8"
  // PCMenu 本身只在 xl 断点以上显示
```

---

## 三、Home & Effects 在桌面端**出现**的 URL

> 判断依据：对全部 `*.page.tsx` 做 `showHeaderMenu` grep，**不在结果中**的页面即为显示完整导航栏的页面。
> ⚠️ 原文档错误更正：`/` 首页实际设了 `showHeaderMenu: false`，已移至第四节。

### 3.1 营销 / 内容落地页

| URL                           | 对应文件                                       |
| ----------------------------- | ---------------------------------------------- |
| `/pricing`                    | `pricing/index.page.tsx`                       |
| `/about-us`                   | `about-us/index.page.tsx`                      |
| `/whats-new`                  | `whats-new/index.page.tsx`                     |
| `/affiliate-program`          | `affiliate-program/index.page.tsx`             |
| `/creative-partner-program`   | `creative-partner-program/index.page.tsx`      |
| `/influencer-program`         | `influencer-program/index.page.tsx`            |
| `/credits-faqs`               | `credits-faqs/index.page.tsx`                  |
| `/free-trial-policy`          | `free-trial-policy/index.page.tsx`             |
| `/privacy-policy`             | `privacy-policy/index.page.tsx`                |
| `/terms-and-conditions`       | `terms-and-conditions/index.page.tsx`          |
| `/refund-policy`              | `refund-policy/index.page.tsx`                 |
| `/review`                     | `review/index.page.tsx`                        |
| `/mcp`                        | `mcp/index.page.tsx`                           |
| `/special-topic`              | `special-topic/index.page.tsx`                 |
| `/campaign/ai-christmas-tree` | `campaign/ai-christmas-tree/index.page.tsx`    |
| `/campaign/echoes-of-myth`    | `campaign/echoes-of-myth/index.page.tsx`       |
| `/[...slug]`                  | `[...slug]/index.page.tsx`（catch-all 通用页） |

### 3.2 模型落地页（原文档遗漏）

| URL              | 对应文件                       | 备注                                                              |
| ---------------- | ------------------------------ | ----------------------------------------------------------------- |
| `/m`             | `m/index.page.tsx`             | 模型列表页，`transparentOnScrollTop0: true`                       |
| `/m/[...params]` | `m/[...params]/index.page.tsx` | 模型详情落地页，`transparentOnScrollTop0: true, stayOnPage: true` |

### 3.3 认证 / 账户页

| URL                            | 对应文件                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `/sign-in`                     | `sign-in/index.page.tsx`（`transparentOnScrollTop0: true, showLoginUserInfo: false`） |
| `/sign-up`                     | `sign-up/index.page.tsx`                                                              |
| `/forgot-password`             | `forgot-password/index.page.tsx`                                                      |
| `/reset-password`              | `reset-password/index.page.tsx`                                                       |
| `/settings/[[...params]]`      | `settings/[[...params]]/index.page.tsx`                                               |
| `/app/account/billing`         | `app/account/billing/index.page.tsx`                                                  |
| `/app/managements/[[...type]]` | `app/managements/[[...type]]/index.page.tsx`                                          |
| `/app/refer`                   | `app/refer/index.page.tsx`                                                            |

### 3.4 创作 / 内容详情页

| URL                  | 对应文件                                   |
| -------------------- | ------------------------------------------ |
| `/c/[...params]`     | `c/[...params]/index.page.tsx`（创作详情） |
| `/c`                 | `c/index.page.tsx`                         |
| `/v/[id]`            | `v/[id]/index.page.tsx`（视频详情）        |
| `/hub/[[...params]]` | `hub/[[...params]]/index.page.tsx`         |
| `/your-creations`    | `your-creations/index.page.tsx`            |

### 3.5 工具 / 生成器落地页

| URL                           | 对应文件                                    | 备注                                                 |
| ----------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| `/ai-video`                   | `ai-video/index.page.tsx`                   |                                                      |
| `/ai-image-generator`         | `ai-image-generator/index.page.tsx`         | 注意：`/ai-image-generator/[...params]` 设了 `false` |
| `/chat-to-image`              | `chat-to-image/index.page.tsx`              |                                                      |
| `/consistent-character-video` | `consistent-character-video/index.page.tsx` |                                                      |
| `/ai-music-video-generator`   | `ai-music-video-generator/index.page.tsx`   |                                                      |
| `/ai-news-video-generator`    | `ai-news-video-generator/index.page.tsx`    |                                                      |
| `/ai-ugc-video-generator`     | `ai-ugc-video-generator/index.page.tsx`     |                                                      |
| `/ai-viral-video-generator`   | `ai-viral-video-generator/index.page.tsx`   |                                                      |
| `/image-to-image-ai`          | `image-to-image-ai/index.page.tsx`          | ⚠️ 原文档误置于不显示列表                            |
| `/video-to-video`             | `video-to-video/index.page.tsx`             | ⚠️ 原文档误置于不显示列表                            |
| `/mimic-motion`               | `mimic-motion/index.page.tsx`               | ⚠️ 原文档误置于不显示列表                            |
| `/photo-effects/[effectUrl]`  | `photo-effects/[effectUrl]/index.page.tsx`  | 注意：`/photo-effects` 列表页设了 `false`            |
| `/template/[templateUrl]`     | `template/[templateUrl]/index.page.tsx`     | 注意：`/template` 列表页设了 `false`                 |
| `/api-platform`               | `api-platform/index.page.tsx`               | 注意：`/api-platform/[slug]` 设了 `false`            |
| `/api-platform/m/kling-ai`    | `api-platform/m/kling-ai/index.page.tsx`    |                                                      |
| `/im/[...params]`             | `im/[...params]/index.page.tsx`             |                                                      |
| `/im`                         | `im/index.page.tsx`                         |                                                      |

### 3.6 其他功能页

| URL                               | 对应文件                                        |
| --------------------------------- | ----------------------------------------------- | --------------------------------------------- |
| `/assets`                         | `assets/index.page.tsx`                         | 注意：`/assets/[generationType]` 设了 `false` |
| `/download`                       | `download/index.page.tsx`                       |
| `/app-download`                   | `app-download/index.page.tsx`                   |
| `/invitation-landing`             | `invitation-landing/index.page.tsx`             |
| `/credit/[platform]`              | `credit/[platform]/index.page.tsx`              |
| `/home/canvas`                    | `home/canvas/index.page.tsx`                    |
| `/facebook-data-deletion-request` | `facebook-data-deletion-request/index.page.tsx` |

---

## 四、Home & Effects 在桌面端**不出现**的 URL

> 判断依据：grep `showHeaderMenu` 在 `*.page.tsx` 中的结果（已验证）。

### 4.1 设置了 `showHeaderMenu: false`（桌面端菜单隐藏，移动端保留汉堡菜单）

| URL                               | 对应文件                                             |
| --------------------------------- | ---------------------------------------------------- |
| `/`（首页）                       | `index.page.tsx:168` ⚠️ 原文档误置于显示列表         |
| `/explore/[...slug]`              | `explore/[...slug].page.tsx:97`                      |
| `/use-cases`                      | `use-cases/index.page.tsx:45`                        |
| `/text-to-video`                  | `text-to-video/index.page.tsx:375`                   |
| `/image-to-video`                 | `image-to-video/index.page.tsx:320`                  |
| `/ai-image-generator/[...params]` | `ai-image-generator/[...params]/index.page.tsx:96`   |
| `/ai-effects`                     | `ai-effects/index.page.tsx:95`                       |
| `/ai-effects/[...params]`         | `ai-effects/[...params]/index.page.tsx:64`           |
| `/ai-animation-generator`         | `ai-animation-generator/index.page.tsx:103`          |
| `/ai-avatar`                      | `ai-avatar/index.page.tsx:316`                       |
| `/ai-avatar/[...params]`          | `ai-avatar/[...params]/index.page.tsx:71`            |
| `/ai-product-avatar`              | `ai-product-avatar/index.page.tsx:227`               |
| `/ai-singing-avatar`              | `ai-singing-avatar/index.page.tsx:252`               |
| `/ai-video-editor`                | `ai-video-editor/index.page.tsx:171`                 |
| `/ai-video-agent`                 | `ai-video-agent/index.page.tsx:28`                   |
| `/avatar-studio`                  | `avatar-studio/index.page.tsx:85`（`nav: true`）     |
| `/image-studio`                   | `image-studio/index.page.tsx:70`（`nav: true`）      |
| `/video-studio`                   | `video-studio/index.page.tsx:74`（`nav: true`）      |
| `/image-generators`               | `image-generators/index.page.tsx:57`                 |
| `/image-tools`                    | `image-tools/index.page.tsx:71`                      |
| `/image-inspiration`              | `image-inspiration/index.page.tsx:78`                |
| `/inspiration`                    | `inspiration/index.page.tsx:75`                      |
| `/photo-effects`（列表页）        | `photo-effects/index.page.tsx:72`                    |
| `/template`（列表页）             | `template/index.page.tsx:112`                        |
| `/tool`                           | `tool/index.page.tsx:70`                             |
| `/assets/[generationType]`        | `assets/[generationType].page.tsx:62`（`nav: true`） |
| `/profile/[...params]`            | `profile/[...params]/index.page.tsx:190`             |
| `/api-platform/[slug]`            | `api-platform/[slug]/index.page.tsx:171`             |
| `/app`                            | `app/index.page.tsx:233`                             |
| `/app/[...params]`                | `app/[...params]/index.page.tsx:69`                  |
| `/app/ai-agent`                   | `app/ai-agent/index.page.tsx:45`                     |
| `/ad/[...params]`                 | `ad/[...params]/index.page.tsx:168`                  |

### 4.2 未通过 grep 验证、需单独确认

| URL                  | 说明                                          |
| -------------------- | --------------------------------------------- |
| `/app-install`       | 未在 grep 结果中，可能通过其他方式隐藏 Header |
| `/paid-successfully` | 同上                                          |

---

## 五、Effects 下拉菜单包含的子 URL

点击 Effects 菜单项展开后，包含以下子链接（仅为导航入口，页面本身仍存在）：

### Video Effects

| URL                                              | 菜单名                           |
| ------------------------------------------------ | -------------------------------- |
| `/video-effects`                                 | Video Effects（分组入口）        |
| `/video-effects/ai-kissing`                      | AI Kissing Video Generator       |
| `/video-effects/ai-hug`                          | AI Hug Generator                 |
| `/video-effects/ai-twerk-video-generator`        | AI Twerk Generator               |
| `/video-effects/earth-zoom-in`                   | Earth Zoom In                    |
| `/video-effects/ai-bikini`                       | AI Bikini Generator              |
| `/video-effects/into-the-mouth`                  | Into The Mouth                   |
| `/video-effects/ai-jiggle-video-effect`          | AI Jiggle Video Effect           |
| `/video-effects/action-figure`                   | Action Figure                    |
| `/video-effects/ai-muscle-generator`             | AI Muscle Generator              |
| `/video-effects/ai-french-kiss-video-generator`  | AI French Kiss Video Generator   |
| `/video-effects/ai-fake-date-video-generator`    | AI Fake Date Video Generator     |
| `/video-effects/ai-360-rotation-video-generator` | AI 360° Rotation Video Generator |

### Image Effects

| URL                                                   | 菜单名                               |
| ----------------------------------------------------- | ------------------------------------ |
| `/photo-effects`                                      | Image Effects（分组入口）            |
| `/photo-effects/ai-selfie-with-celebrities-generator` | AI Selfie with Celebrities Generator |
| `/photo-effects/polaroid-duo-selfie`                  | Polaroid Duo Selfie                  |
| `/photo-effects/pregnant-ai`                          | Pregnant AI                          |
| `/photo-effects/ai-polaroid-maker`                    | AI Polaroid Maker                    |
| `/photo-effects/ai-action-figure-generator`           | AI Action Figure Generator           |
| `/photo-effects/ai-fat-filter`                        | AI Fat Filter                        |
| `/photo-effects/ghibli-ai`                            | Ghibli AI Generator                  |
| `/photo-effects/ai-beardless-filter`                  | AI Beardless Filter                  |
| `/photo-effects/ai-simpsons-character-generator`      | AI Simpsons Character Generator      |
| `/photo-effects/pixar-ai-generator`                   | Pixar AI Generator                   |
| `/photo-effects/ai-caricature-maker`                  | AI Caricature Maker                  |
| `/photo-effects/ai-baby-filter`                       | AI Baby filter                       |

---

## 六、关键文件速查

| 文件                                                   | 作用                                     |
| ------------------------------------------------------ | ---------------------------------------- |
| `_layout/Header/HeaderMenu/menu.tsx:96`                | Home 和 Effects 菜单项定义               |
| `_layout/Header/HeaderMenu/menu.tsx:960`               | `hidden` 过滤逻辑                        |
| `_layout/Header/HeaderMenu/index.tsx:40`               | `showHeaderMenu` → `xl:hidden` 控制      |
| `_layout/Header/HeaderMenu/_block/PCMenu/index.tsx:26` | PCMenu 只在 `xl:flex` 显示               |
| `_layout/Header/index.tsx:44`                          | `showHeaderMenu` 默认值 `true`           |
| `_layout/index.tsx:122`                                | `headerProps !== false` 控制 Header 渲染 |
