# 生成结果 Toast 提醒方案

## Summary

在 pollo.ai 的全局常驻层新增一个“生成结果提醒监听器”，对所有走 generationTaskLink 的页面发起任务进行统一跟踪；任务进入终态后，用
useAntdContext().message.open 弹出可点击 toast，点击统一跳转到 /generate。

本期范围按你的选择收口为：

- 支持所有挂接到 generationTaskLink 的页面发起的任务
- 当前页面如果是 /generate 或 agent 详情页，则不直接弹提醒
- 待提醒任务需要跨刷新保留
- 不专门为浏览器后台节流做额外保证；页面恢复活跃后补轮询/补提醒即可

## Key Changes

- 在 PolloGlobalEvent 所在的全局层增加 useGenerationResultToast 一类的 hook，职责是：
    - 监听 creationGenerateEmitter
    - 记录本次可提醒任务的 recordId / taskLabel / status / createdAt
    - 恢复并轮询本地持久化的 pending 任务
    - 在任务 succeed / failed 时弹一次 toast，并从 pending 队列移除
- 扩展 generationTaskLink -> creationGenerateEmitter 的成功事件载荷，补充任务展示文案字段，例如 taskLabel 或等价字段；复用它当前已有的
  path-to-type 映射，不新增第二套映射源
- 新增一个轻量持久化队列模块，使用 localStorage 保存 pending toast 任务，至少包含：
    - recordId
    - taskLabel
    - finalStatus（为空表示未完成）
- 轮询策略：
    - 轮询间隔沿用现有生成状态轮询节奏，建议 4-5 秒
- toast 交互与文案：
    - 使用 message.open({ type, content, onClick, key })
    - 成功示例：Image to Video completed
    - 失败示例：Image to Video failed
    - onClick 统一 router.push('/generate')
    - key 基于 recordId + finalStatus 生成，避免重复弹同一终态
- 路由排除规则：
    - 显式排除 /generate
    - agent 详情页按现有 agent 路由家族排除；若当前实现是 /ai-video-agent 承载详情态，则整条 /ai-video-agent 路由先排除，避免在 agent 场
      景内出现重复提醒

## Public API / Interface Changes

      - taskLabel: string

- 新增本地队列数据类型，例如：
    - PendingGenerationToastTask
- 不改后端接口；继续复用 generation.queryRecordDetail

## Test Plan

- 单测：
    - generationTaskLink 成功事件能带出正确 taskLabel
    - 本地 pending 队列可新增、去重、恢复、删除
    - 排除路由判断正确，/generate 和 agent 路由不直接弹
- Hook/组件测试：
    - 任务成功时弹 success toast，失败时弹 error toast
    - 点击 toast 会跳转 /generate
    - 同一 recordId + finalStatus 只弹一次
    - 刷新后 pending 任务能恢复并继续轮询
    - 在排除页完成的任务，切回非排除页后只补弹一次
- 手工验证：
    - 在图生视频等单点页创建任务，留在站内其他页面，任务完成后出现 toast
    - 刷新页面后等待任务完成，仍能收到 toast
    - 位于 /generate 或 agent 详情页时不弹；离开后如有未提示完成项则补弹
    - 任务失败同样有 toast，点击仍跳 /generate

## Assumptions

- /generate 本期即使页面未上线，也先按固定字面路径跳转实现
- “agent 详情页”默认按现有 agent 路由家族整体排除；如果后续有更精确的 detail 路由，再收窄匹配
- 提醒粒度按“每个 record 一条 toast”处理，不做多任务聚合
- 只跟踪当前前端发起并被 generationTaskLink 捕获的任务，不追溯历史老任务
