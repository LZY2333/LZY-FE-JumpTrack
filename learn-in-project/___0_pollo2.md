# 5 Pollo 2.0 开始

## Pollo 2.0

### 功能页面合并

**在功能页主要内容展示上, SEO文章 和 灵感流 是登录与未登录的唯一区别**

现有项目 所有的url 登录与未登录 或称 SEO页与/app页: 未登录展示 SEO文章, 已登录展示 社区灵感流

2.0项目, **已经不论登录与未登录**

修改 SEO文章始终在底部, 社区灵感流 在 SEO文章上方, 已生成态时 Creations 组件展示， 灵感流页面隐藏

增加 顶部tab切换(为 原本用户后台的 chat 和 form模式切换)

增加 未生成/已生成 态(目的是合并 seo页与用户后台),增加 生成结果区, 替换的是 社区灵感流 的位置(chat模式ui略有不同)

- 生成结果区组件 是新组件, /app右侧内嵌History(Creations 组件) 直接放generate

- Form Mode 点击"添加"→ 清空参数，右侧回到缺省态（Sample Video）
    > 为什么要清空参数，用户想连续生成怎么办? 右侧为什么要回到缺省态(灵感流)，不应该展示生成中的内容吗
- 生成结果仅保留当前 session，历史记录去 /assets 或 /generate 查看

### generate页

generate页跳转: **只要不是在功能页本身（当前路由对应的功能）直接生成，都跳转到 /generate。功能页自身的生成结果留在当前页展示**

1. 功能页 — Chat 模式下生成非当前路由功能（5.2.1）

chat模式下，针对非路由对应的功能，点击生成的时候，带着参数跳转到generate页面

即：在 /text-to-video 页面的 chat 框里发起了图生视频任务 → 跳转到 /generate

2. 首页 — 点击 Create（5.2.2）

Ai video / ai image → 点击create，跳转到generate页面

3. Assets 资产页 — Create Similar（5.2.2）

当前内容如果是文生图、图生图、文生视频、图生视频、参考生视频 → 跳转到generate页面，带上参数，并选中对应的模式

4. Assets 内容详情页 — 做同款（5.2.2）

对于chat能支持的能力，都跳转到generate，并带上参数

5. Generate 详情页 — 做同款 + 生成（5.4）

点击做同款，显示chat框，并回填参数 → 点击生成，跳转到generate，并创建任务

6. Explore 页 — 做同款 + 生成（5.5）

chat模式支持的功能 → 回填参数，并选中模式 → 点击生成，跳转到generate，并创建任务

7. Explore 内容详情页 — 做同款 + 生成（5.5）

点击做同款，显示chat框，并回填参数 → 点击生成，跳转到generate，并创建任务

## 项目提问

### 功能板块

功能表单(原/app左侧，现一级功能页左侧)
SEO文章(HideLoggedInContent)
社区灵感流(InspirationModal)
聚合页(/photo-effects /ai-effect /image-tools)
功能页(/text-to-video)
信息流及历史记录(原/app右侧，现/generate)
agent对话记录

### 5.2.1 添加（创建）后右侧的展示内容

https://bcn0tgplxp2e.feishu.cn/wiki/EZPqwRSZJiSMPUk3KXWcmydYn7d

【点击添加，即可清空参数，变成缺省状态（展示sample video）】

点击添加 是指什么操作? prompt提示词的添加？

点击添加 右侧不展示即将生成的内容,而是展示sample？用户靠侧边栏generate得到生成反馈？

未登录与登录状态是否效果一致？form 和 chat 是否效果一致？

## /ai-video-editor 就是最典型的、不受 AB Test 影响、完美匹配截图四区域布局的页

https://pollo.ai/ai-video-editor

/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/ai-video-editor/index.page.tsx

关键行号：

- :48 — MenuLayout isCompactMenu（左侧导航，无 isChatMode）
- :49 — ToolWrap（左右分栏容器）
- :56 — VideoEditForm（左侧表单，w-[420px]）
- :61 — InspirationModal（右侧 Sample，!relative flex-1）
- :63-156 — 下方 SEO 文章区（AIVideoEditor → EditYourVideo → HowTo → Faq → Cta）
