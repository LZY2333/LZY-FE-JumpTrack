# 顶部导航栏修改

## 顶部导航栏总览

| 菜单项           | 组件名称                            | 修改内容                              |
| ---------------- | ----------------------------------- | ------------------------------------- |
| 通知横幅         | TopBanners                          | 无变更                                |
| 活动弹窗         | PromotionPopups                     | 无变更                                |
| 左上角导航       | WorkspaceHeader.LeftMenu            | 5.1.2 移除                            |
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

## WorkspaceHeader.LeftMenu 左上角导航

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

/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/index.tsx:189
