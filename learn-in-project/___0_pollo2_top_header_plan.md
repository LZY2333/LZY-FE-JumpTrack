# Pollo 2.0 顶部 Header 改造方案

03.02 https://bcn0tgplxp2e.feishu.cn/wiki/EZPqwRSZJiSMPUk3KXWcmydYn7d

5.1 顶部Header
5.1.2 顶部信息栏
5.1.3 顶部导航栏
修改按钮跳转地址
301 重定向，配置所有旧路径 -> 新路径？（或者 cms 配置） 参考4.2.2

5.1.4 消息提醒
5.1.5 history改造
5.1.6 project改造

## 当前 Header 结构（代码视角）

```
Header/index.tsx
├── TopBanners + PromotionPopups
├── <header>
│   ├── 左侧
│   │   ├── WorkspaceHeader.LeftMenu（isCompactMenu 时展示）← 5.1.2 要去掉的"左上角导航入口"
│   │   ├── 移动端汉堡菜单图标
│   │   └── Logo → /
│   ├── 中间
│   │   └── Advertisement / Promotion Banner
│   └── 右侧
│       ├── HeaderMenu（顶部导航栏 = 5.1.3）← menu.tsx
│       ├── ProjectDropdown ← 5.1.6
│       ├── History ← 5.1.5 要去掉
│       ├── CreditsInfo
│       ├── FollowClaimCredits
│       ├── MessageDrawer
│       ├── LoginUserInfo（含 refer/billing 等用户菜单链接）← 5.1.2
│       └── StartForFree
```

---

## 5.1.2 顶部信息栏 — 修改方案

"顶部信息栏"= Header 组件 + 用户下拉菜单，分为 logo 分类和 user 分类两部分。

### logo 分类 — Header 主导航栏

对应 `Header/index.tsx` 中的 logo + 导航链接区域。

| 导航名称 | URL | 对应代码位置 | 是否变更 |
|---|---|---|---|
| logo | `/` | `Header/index.tsx:178` — Logo `<Link>` | 有，去掉左上角导航入口 |
| api | `/api-platform` | `HeaderMenu/menu.tsx:941` | 无变更 |
| pricing | `/pricing` | `HeaderMenu/menu.tsx:951` | 无变更 |

#### 去掉左上角导航入口

- 文件：`Header/index.tsx:164-168`
- 当前：`isCompactMenu` 时展示 `<WorkspaceHeader.LeftMenu />`
- 改动：移除该渲染块

```tsx
// 删除以下代码
{
    isCompactMenu ? (
        <div className='hidden xl:block'>
            <WorkspaceHeader.LeftMenu />
        </div>
    ) : null;
}
```

### user 分类 — 用户头像下拉菜单

点击右上角头像后弹出的 `HeaderActions` 弹窗，菜单数据来自 `useGetAccountMenuList`。

- 渲染组件：`_components/HeaderActions/index.tsx`
- 数据源：`app/_hooks/menu.tsx`

| 导航名称 | 当前 URL | 新 URL | 代码位置 | 是否变更 |
|---|---|---|---|---|
| Assets | `/assets` | `/assets` | `menu.tsx:49` | 无变更 |
| Pricing | `/pricing` | `/pricing` | `menu.tsx:56` | 无变更 |
| Billing | `/app/account/billing` | `/account/billing` | `menu.tsx:64` | **变更** |
| Refer a Friend | `/app/refer` | `/refer` | `menu.tsx:86` | **变更** |
| Profile | `/profile/xxx` | `/profile/xxx` | `menu.tsx:106` | 无变更 |
| My Account | `/settings` | `/settings` | `menu.tsx:114` | 无变更 |

#### Billing URL 变更

- 文件：`app/_hooks/menu.tsx:64`
- 当前：`url: '/app/account/billing'`
- 改为：`url: '/account/billing'`

#### Refer URL 变更

- 文件：`app/_hooks/menu.tsx:86`
- 当前：`<Link href='/app/refer' ...>`
- 改为：`<Link href='/refer' ...>`

---

## 5.1.3 顶部导航栏 — 修改方案

文档原文："顶部导航栏还是保留，主要用于纯seo页面。"

核心文件：`Header/HeaderMenu/menu.tsx` 中的 `useHeaderMenu`

### 需要更新的路由地址

| 菜单项        | 字段              | 当前值               | 新值                    | 行号范围 |
| ------------- | ----------------- | -------------------- | ----------------------- | -------- |
| Apps          | `link`            | `/use-cases`         | `/app`                  | ~108     |
| Video Effects | `signInGroupHref` | `/app/video-effects` | `/video-effects`        | ~337     |
| Image Effects | `signInGroupHref` | `/app/photo-effects` | `/photo-effects`        | ~529     |
| Video Tools   | `groupHref`       | `/tool`              | `/tools`                | ~730     |
| Pro Effects   | `link`            | `/app/pro-effects`   | `/video-effects` 或删除 | ~316     |

### 无变更项

| 菜单项        | URL                      | 状态   |
| ------------- | ------------------------ | ------ |
| Home          | `/`                      | 无变更 |
| Explore       | `/explore`               | 无变更 |
| Video AI 子项 | `/image-to-video` 等     | 无变更 |
| Image AI 子项 | `/ai-image-generator` 等 | 无变更 |
| Image Tools   | `/image-tools`           | 无变更 |
| Assets        | `/assets`                | 无变更 |
| API           | `/api-platform`          | 无变更 |
| Pricing       | `/pricing`               | 无变更 |

---

## 5.1.5 history 改造

文档原文："去掉history"

- 文件：`Header/index.tsx:246`
- 当前：`{isSignIn && <History />}`
- 改动：移除该行及 `History` 组件的 import
- 相关文件：`Header/History/` 目录（可后续清理）

---

## 5.1.6 project 改造

文档要求：

### 1. 名称变更

- `project` → `workspace`
- 所有 default project 改名为 `[user name]'s workspace`
- 其他 project 正常展示

### 2. 展示位置

- 保持右上角（当前 `ProjectDropdown` 位置不变）

### 3. 展示页面控制

| 页面                            | 是否展示   |
| ------------------------------- | ---------- |
| Generate（新增页面）            | 展示       |
| Agent 落地页                    | 展示       |
| Agent 详情页                    | 展示       |
| Assets 资产页                   | 展示       |
| 功能聚合页（/photo-effects 等） | **不展示** |
| 功能页（/text-to-video 等）     | **不展示** |

- 文件：`Header/index.tsx:238-244`，`Header/ProjectDropdown/`
- 改动：根据当前路由判断是否渲染 `ProjectDropdown`

---

## 4.2.2 重定向（301）

所有旧路径需要 301 到新路径：

| 旧路径                 | 新路径             | 说明                           |
| ---------------------- | ------------------ | ------------------------------ |
| `/app/ai-video`        | `/`                | 跳转首页，选中 video           |
| `/app/ai-image`        | `/`                | 跳转首页，选中 image           |
| `/app/ai-agent`        | `/ai-video-agent`  |                                |
| `/app/ai-avatar`       | `/ai-avatar`       |                                |
| `/app/apps`            | `/app`             |                                |
| `/app/pro-effects`     | `/video-effects`   |                                |
| `/app/video-effects`   | `/video-effects`   |                                |
| `/app/photo-effects`   | `/photo-effects`   |                                |
| `/app/tool`            | `/tools`           |                                |
| `/app/image-tools`     | `/image-tools`     |                                |
| `/app/account/billing` | `/account/billing` |                                |
| `/app/refer`           | `/refer`           |                                |
| 信息流表单页           | 对应功能页         | 所有 `/app` 下的表单页都重定向 |

实现方式待定：Next.js `rewrites/redirects` 配置 或 CMS 配置

---

## 推荐执行顺序

1. **5.1.3** — 更新 `menu.tsx` 路由地址（改动集中，风险低）
2. **5.1.2** — 去掉左上角导航入口 + 更新 refer/billing URL
3. **5.1.5** — 移除 History 组件
4. **5.1.6** — project → workspace 改造（需后端配合）
5. **4.2.2** — 301 重定向（需确认实现方式，影响面最大）

---

## 涉及文件清单

- `web/src/pages/pollo.ai/_layout/Header/index.tsx` — Header 主组件（logo、左上角导航入口、History、ProjectDropdown）
- `web/src/pages/pollo.ai/_layout/Header/HeaderMenu/menu.tsx` — 顶部导航栏菜单数据（5.1.3）
- `web/src/pages/pollo.ai/_layout/Header/History/index.tsx` — History 组件（5.1.5 要移除）
- `web/src/pages/pollo.ai/_layout/Header/ProjectDropdown/index.tsx` — Project 下拉组件（5.1.6）
- `web/src/pages/pollo.ai/app/_hooks/menu.tsx` — 用户下拉菜单数据源（billing/refer URL 变更）
- `web/src/pages/pollo.ai/_components/HeaderActions/index.tsx` — 用户下拉菜单渲染组件
- `web/src/pages/pollo.ai/_blocks/WorkspaceHeader/` — 左上角导航入口（5.1.2 要移除）
