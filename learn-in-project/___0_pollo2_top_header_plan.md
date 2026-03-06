# Pollo 2.0 顶部 Header 改造方案

03.02 https://bcn0tgplxp2e.feishu.cn/wiki/EZPqwRSZJiSMPUk3KXWcmydYn7d

5.1 顶部Header
5.1.2 顶部信息栏
5.1.3 顶部导航栏
修改按钮跳转地址
301 重定向，配置所有旧路径 -> 新路径？（或者 cms 配置） 参考4.2.2

5.1.4 消息提醒(待定)
5.1.5 history改造
5.1.6 project改造

## 当前 Header 结构（代码视角）

```
web/src/pages/pollo.ai/_layout/Header/index.tsx
├── TopBanners + PromotionPopups
├── <header>
│   ├── 左侧
│   │   ├── WorkspaceHeader.LeftMenu ← _blocks/WorkspaceHeader/primitive/LeftMenu.tsx
│   │   │   （isCompactMenu 时展示, 5.1.2 要去掉的"左上角导航入口"）
│   │   ├── 移动端汉堡菜单图标
│   │   └── Logo → / ← Header/index.tsx:178
│   ├── 中间
│   │   └── Advertisement / Promotion Banner
│   └── 右侧
│       ├── HeaderMenu（顶部导航栏 = 5.1.3）← Header/HeaderMenu/menu.tsx
│       ├── ProjectDropdown ← Header/ProjectDropdown/index.tsx（5.1.6）
│       ├── History ← Header/History/index.tsx（5.1.5 要去掉）
│       ├── CreditsInfo
│       ├── FollowClaimCredits
│       ├── MessageDrawer ← Header/MessageDrawer/index.tsx
│       ├── LoginUserInfo ← Header/LoginUserInfo/index.tsx
│       │   └── 点击头像弹出 HeaderActions ← _components/HeaderActions/index.tsx
│       │       └── 菜单数据 ← app/_hooks/menu.tsx（useGetAccountMenuList）
│       └── StartForFree ← Header/StartForFree/index.tsx
```

## 当前 Header 一级子项

| 菜单项           | 组件名称                            | 修改内容                              |
| ---------------- | ----------------------------------- | ------------------------------------- |
| 通知横幅         | TopBanners                          | 无变更                                |
| 活动弹窗         | PromotionPopups                     | 无变更                                |
| 左侧导航入口     | WorkspaceHeader.LeftMenu            | 5.1.2 移除                            |
| 移动端菜单       | Header 内部移动端 icon 按钮         | 无变更                                |
| Logo             | Link（含 logo span）                | 无变更                                |
| 广告位           | Advertisement                       | 无变更                                |
| 促销横幅         | Header 内促销 banner 区块（inline） | 无变更                                |
| HeaderMenu       | HeaderMenu                          | 5.1.3 修改 5 个菜单项跳转地址         |
| Project          | ProjectDropdown                     | 5.1.6 改名 workspace + 按页面控制展示 |
| History          | History                             | 5.1.5 移除                            |
| Credits          | CreditsInfo                         | 无变更                                |
| Claim Credits    | FollowClaimCredits                  | 无变更                                |
| Message          | MessageDrawer                       | 无变更                                |
| Login / UserInfo | LoginUserInfo                       | Billing/Refer URL 变更                |
| Start for Free   | StartForFree                        | 无变更                                |

## 5.1.2 顶部信息栏 + 5.1.3 顶部导航栏 — 修改方案

### WorkspaceHeader.LeftMenu 左上角导航

- 文件：`Header/index.tsx:189-193`
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

涉及文件：

- 左上角导航入口渲染块 /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/index.tsx:189
- LeftMenu 组件 /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_blocks/WorkspaceHeader/primitive/LeftMenu.tsx:1

### HeaderActions 头像下拉

点击右上角头像后弹出的 `HeaderActions` 弹窗，菜单数据来自 `useGetAccountMenuList`。

- 渲染组件：`_components/HeaderActions/index.tsx`
- 数据源：`app/_hooks/menu.tsx`（`useGetAccountMenuList`）

| 菜单项         | 当前 URL                             | 新 URL             | 代码位置       | 是否变更 |
| -------------- | ------------------------------------ | ------------------ | -------------- | -------- |
| Language       | 语言子链（非 URL 跳转）              | —                  | `menu.tsx:35`  | 无变更   |
| Assets         | `/assets`                            | `/assets`          | `menu.tsx:49`  | 无变更   |
| Pricing        | `/pricing`                           | `/pricing`         | `menu.tsx:56`  | 无变更   |
| Billing        | `/app/account/billing`               | `/account/billing` | `menu.tsx:64`  | **变更** |
| Credits        | 领积分入口（非 URL 跳转）            | —                  | `menu.tsx:71`  | 无变更   |
| Refer a Friend | `/app/refer`                         | `/refer`           | `menu.tsx:86`  | **变更** |
| Contact Us     | `mailto:supportEmail`（非 URL 跳转） | —                  | `menu.tsx:96`  | 无变更   |
| Profile        | `/profile/用户名`                    | `/profile/用户名`  | `menu.tsx:106` | 无变更   |
| My Account     | `/settings`                          | `/settings`        | `menu.tsx:114` | 无变更   |
| Management     | 权限路由动态跳转（非菜单配置）       | —                  | —              | 无变更   |
| Logout         | 退出登录（非 URL 跳转）              | —                  | —              | 无变更   |

#### Billing URL 变更

- 文件：`menu.tsx:64`
- 当前：`url: '/app/account/billing'`
- 改为：`url: '/account/billing'`

#### Refer URL 变更

- 文件：`menu.tsx:86`
- 当前：`<Link href='/app/refer' ...>`
- 改为：`<Link href='/refer' ...>`

涉及文件：

- 用户下拉菜单渲染组件 /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_components/HeaderActions/index.tsx:1
- Assets /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/\_hooks/menu.tsx:49
- Pricing /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/\_hooks/menu.tsx:56
- Billing（**变更**） /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/\_hooks/menu.tsx:64
- Refer a Friend（**变更**） /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/\_hooks/menu.tsx:86
- Profile /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/\_hooks/menu.tsx:106
- My Account /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/\_hooks/menu.tsx:114

---

### HeaderMenu 组件修改

| 菜单项        | 字段              | 当前值               | 新值             | 行号 |
| ------------- | ----------------- | -------------------- | ---------------- | ---- |
| Apps          | `link`            | `/use-cases`         | `/app`           | L109 |
| Pro Effects   | `link`            | `/app/pro-effects`   | `/video-effects` | L317 |
| Video Effects | `signInGroupHref` | `/app/video-effects` | `/video-effects` | L339 |
| Image Effects | `signInGroupHref` | `/app/photo-effects` | `/photo-effects` | L531 |
| Video Tools   | `groupHref`       | `/tool`              | `/video-tools`   | L732 |

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

下面这些路由全干掉，都到 /app 下访问

涉及文件：

- Apps /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderMenu/menu.tsx:109
- Pro Effects /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderMenu/menu.tsx:317
- Video Effects /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderMenu/menu.tsx:339
- Image Effects /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderMenu/menu.tsx:531
- Video Tools /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderMenu/menu.tsx:732

---

## 5.1.5 history 改造

文档原文："去掉history"

- 文件：`Header/index.tsx:277`
- 当前：`{isSignIn && <History />}`
- 改动：移除该行及 `History` 组件的 import（第 34 行 `import History from './History'`）
- 相关文件：`Header/History/` 目录（可后续清理）

涉及文件：

- History 渲染行 /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/index.tsx:277
- History import /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/index.tsx:34
- History 组件目录 /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/History/

---

## 5.1.6 project 改造

文档要求：

### 1. 名称变更

- `project` → `workspace`
- 所有 default project 改名为 `[user name]'s workspace`
- 其他 project 正常展示

#### 实现方案：default project → [user name]'s workspace

`DEFAULT_PROJECT_NAME` 是纯前端显示 fallback，不会写入后端。项目名称由 `api.userProject.getListV2` 返回，`DEFAULT_PROJECT_NAME` 仅在后端返回空名称时兜底显示，修改不影响已有数据。

涉及文件：

- ProjectName.tsx — 常量定义 + 4 处引用 /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/ProjectDropdown/ProjectName.tsx:16
    - L16: 删除 `const DEFAULT_PROJECT_NAME = 'Untitled Project'`
    - L60: 从 `useSessionInfo()` 额外解构 `sessionData`
    - 新增: `const defaultProjectName = sessionData?.user?.name ? \`${sessionData.user.name}'s Workspace\` : 'Untitled Project'`
    - L108, L297, L337, L488: `DEFAULT_PROJECT_NAME` → `defaultProjectName`
- ProjectItem.tsx — 常量定义 + 5 处引用 /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/ProjectDropdown/ProjectItem.tsx:11
    - L11: 删除 `const DEFAULT_PROJECT_NAME = 'Untitled Project'`
    - 改为从 props 接收 `defaultProjectName`（由 ProjectName 传入）
    - L43, L47, L66, L67, L286, L352: `DEFAULT_PROJECT_NAME` → `defaultProjectName`
- sessionInfo.ts — user name 数据源 /Users/a111111/code/ai-video-collection/web/src/contexts/AuthContext/hooks/sessionInfo.ts:17（`sessionData` 即 `session.data`，`session.data.user.name` 来自 NextAuth `DefaultUser`）
- index.tsx — 创建项目接口调用 /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/ProjectDropdown/index.tsx:69（`createProject` 传入用户输入的名称，不涉及 `DEFAULT_PROJECT_NAME`，无需改动）

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

- 文件：`Header/index.tsx:268-274`
- 改动：根据当前路由判断是否渲染 `ProjectDropdown`

涉及文件：

- ProjectDropdown 渲染块 /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/index.tsx:268
- ProjectDropdown 组件 /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/ProjectDropdown/index.tsx:1

## 涉及文件清单

- Header 主组件 /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/index.tsx:1 — logo、左上角导航入口、History、ProjectDropdown
- 顶部导航栏菜单数据（5.1.3） /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderMenu/menu.tsx:1
- History 组件（5.1.5 要移除） /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/History/index.tsx:1
- Project 下拉组件（5.1.6） /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/ProjectDropdown/index.tsx:1
- 用户下拉菜单数据源（billing/refer URL 变更） /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/app/\_hooks/menu.tsx:1
- 用户下拉菜单渲染组件 /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_components/HeaderActions/index.tsx:1
- 左上角导航入口（5.1.2 要移除） /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_blocks/WorkspaceHeader/
