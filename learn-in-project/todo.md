# todo

mcp:chrome-devtools
skill:figma-to-code
skill:requirement-compiler
skill:superpowers
claude

## 6. Pollo2.0 两星期

**小屏幕问题**

**检查遗漏翻译问题**

### apps聚合页改造
移动端要不要考虑

### 剩余事项综合
✅ Video Image Tools下拉(移动端)
✅ 导航路径修改
✅ 问产品:消息提醒移动端适配? 移动端不需要
✅ 使用统一轮询，修改toast提醒
✅ 移动端claim free credits 改为一级导航，从userInfo中去除
✅ 所有的default project都改成【user name’s workspace】
✅ projectId初始化获取优化
✅ UserInfo间距调整,去除divider,增加y轴滚动条

✅ 问产品:小屏左侧菜单 以及左上角的导航菜单同时存在
✅ 移动端左上角导航栏effects 和pro effects 重复
toast提醒修改样式
Project样式偏移

✅ 小屏幕多project间距有问题

后管代码自测

### 周二 周三 顶部导航栏: Credits下拉、Video Image Tools下拉、User下拉、移动端导航栏

✅ 1. Video Image Tools下拉
✅ 2. Video Image Tools下拉(移动端)
✅ 3. Credits下拉
✅ 4. User下拉
✅ 5. User下拉(移动端)
✅ 6. history / 左上角导航 / workspace 删除
✅ 7. 导航路径修改
✅ 8. Credits下拉回退

### ✅ 周四 project改造

✅ PC端project
✅ 移动端project

### 周五 增加消息提醒toast

✅ 1. 全局挂载
✅ 2. 统一监听事件
✅ 3. 轮询
✅ 4. 查询生成状态的接口
✅ 5. 自测
✅ 6. 如何解决翻译问题?
✅ 7. 展示的 taskLabel 是否老旧需要改？

useGenerationResultToast 删除初始化

问产品:移动端适配?
问产品:3秒一次轮询, 同时成功2条, 需要做只弹一条toast吗(毕竟目的只是提醒和跳转)? 如果一条成功一条失败,只弹成功?
只弹一条，只弹最后一条

**是否复用useRecordsStatusMonitor**

1. useGenerationResultToast 是事件驱动,没必要事件硬塞records数组,再传给 useRecordsStatusMonitor 做响应式
2. useRecordsStatusMonitor 非专门轮询作用, toast 后续可能会分化(去重、限频、点击跳转、本地缓存、轮询)
如果要强行对接，你需要：
3. 把 pendingRef 的 Map 转成数组传给 monitor，还得构造 CreationItem 结构
4. 在 onFinished 回调里再做 toast 逻辑和去重
5. 核心逻辑: monitor 的 clearTimer 行为（有完成就停）和 toast 的需求冲突 —— toast 需要持续轮询直到队列清空(当然外部也可以再次setRecord继续)

轮询报错,之后重试次数

## 5 Pollo 2.0 开始

03.02 <https://bcn0tgplxp2e.feishu.cn/wiki/EZPqwRSZJiSMPUk3KXWcmydYn7d>

5.1 顶部Header
5.1.2 顶部信息栏
5.1.3 顶部导航栏
5.1.4 消息提醒(暂不修改)
5.1.5 history改造
5.1.6 project改造

弹窗关闭以后，language回归收起状态

## 4

03.02
去掉顶部导航的 home 和 effects自测(涉及页面多)
代码问题分析

## 3

02.27 去掉顶部导航的 home 和 effects,移动端不要动,注意不要影响移动端

## 2

02.26 台管理模板页面 表格中 (已关联的分类)列 展示title 改为展示 code

1.✅ 展示 title 改为展示 categoryCode
2.✅ 修复 部分 categoryCode 丢失的问题

## 1

02.25 按钮文案超长 web端 移动端

1. ✅ 移动端 视频详情
2. ✅ 移动端 图片列表顶部收藏标题（其他人修复）
3. ✅ 移动端 tab:创建crea/动态storia 下的 视频下的 按钮超长挤成了纵向排列（其他人修复）
4. ✅ web端 视频详情 按钮文案超长
5. ✅ web端 视频详情 创造crea 按钮文案超长
6. ✅ web端 视频详情 底部右侧红色主按钮文案超长导致 左侧四按钮 纵向排列

多语言情况下超长
<https://www.tapd.cn/tapd_fe/my/work?dialog_preview_id=bug_1147904281001009723>

## 0 prompt

让 ai 判断如果对非变更代码有影响
