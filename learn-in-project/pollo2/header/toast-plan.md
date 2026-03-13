# 生成结果 Toast 提醒代码修改文档

## 背景

本次需求是在 `pollo.ai` 站内，为所有走统一生成链路的任务增加“生成结果 toast 提醒”能力。

目标行为：

- 用户在支持页面发起生成任务后，任务完成时弹出 antd toast
- toast 需要区分成功和失败，例如：
  - `Image to Video completed`
  - `Image to Video failed`
- 点击 toast 后统一跳转到 `/generate`
- 当前页面如果是 `/generate` 或 agent 详情页，不直接弹提醒
- 即使刷新页面，之前已发起但未完成的任务也要继续保留提醒能力
- 本期范围按统一链路接入，不只限某一个单点页面

---

## 总体实现思路

整体调用链如下：

```text
用户发起生成
-> tRPC mutation 经过 generationTaskLink
-> generationTaskLink 发出 creationGenerate started/success/failed 事件
-> 全局监听 hook 接收 success 事件并记录 pending 任务
-> 全局轮询 queryRecordDetail
-> 任务进入 succeed / failed 终态
-> useAntdContext().message.open 弹 toast
-> 用户点击 toast
-> router.push('/generate')
```

关键设计决策：

- 任务接入点放在 `generationTaskLink`
  - 因为这是所有统一生成请求的前端拦截入口
- 全局提醒监听放在 `PolloGlobalEvent`
  - 因为它挂在 `RootLayout` 下，页面切换时不会销毁
- 状态查询继续复用 `queryRecordDetail`
  - 不新增后端接口，不改后端协议
- 待提醒任务用 `localStorage` 持久化
  - 因为需求要求刷新后仍保留提醒能力
- toast 使用 `useAntdContext().message.open`
  - 符合 antd toast 语义，并支持 `onClick`

---

## 1. `web/src/pages/pollo.ai/_components/Creations/events.ts`

### 修改目标

扩展统一生成事件载荷，让事件本身携带任务名称和来源 path。

### 预期 diff

```diff
 interface CreationGeneratePayload {
   type: 'started' | 'success' | 'failed'
   tempRecordId?: string
   config?: Record<string, unknown>
   detail?: CreationRecordItem
   id?: number
+  taskLabel?: string
+  opPath?: string
 }

 export interface Events {
   // 成功创建新纪录
   // TODO@YIDOON types
   createRecordSuccess: (payload: any) => void
   creationGenerate: (payload: CreationGeneratePayload) => void
 }
```

### 修改内容说明

#### 新增 `taskLabel`

作用：

- 用于 toast 直接展示任务名称
- 避免后续全局监听器再自己维护一份 path -> 文案映射

示例值：

- `Image to Video`
- `Text to Video`
- `Face Swap`

#### 新增 `opPath`

作用：

- 用于记录当前任务对应的 tRPC 路径
- 便于后续扩展过滤逻辑、排查来源、调试问题
- 相比只记录文案，path 更稳定

### 决策理由

如果不在统一事件层补充这两个字段，后续全局提醒只能：

- 自己重复维护一份生成类型映射表
- 或只能显示通用文案 `Generation completed`

前者有重复维护问题，后者用户感知太弱。
所以应当在事件源头把任务元信息一次性补齐。

### 涉及对象说明

- `CreationGeneratePayload`
  - 前端统一生成事件的数据结构
- `creationGenerate`
  - 所有生成开始/成功/失败都会经过的统一事件

---

## 2. `web/src/utils/generation-task-link.ts`

### 修改目标

在统一 tRPC 拦截链路中，把任务文案和 path 注入到事件载荷中。

### 预期 diff

```diff
 export const generationTaskLink: TRPCLink<AppRouter> = () => {
   return ({ next, op }) => {
     let tempRecordId: string | undefined

     const targetVideoTask = videoGeneratePaths.find(
       (item) => item.path === op.path,
     )
     const targetVideoToolTask = videoToolGeneratePaths.find(
       (item) => item.path === op.path,
     )
     const targetImageTask = imageGeneratePaths.find(
       (item) => item.path === op.path,
     )
     const targetImageToolTask = imageToolGeneratePaths.find(
       (item) => item.path === op.path,
     )

     const condition =
       targetVideoTask ||
       targetImageTask ||
       targetImageToolTask ||
       targetVideoToolTask
+
+    const taskLabel = condition?.type || 'Generation'

     const handleCreationGenerateStarted = () => {
       if (condition) {
         tempRecordId = getRequestId()
         creationGenerateEmitter.emit('creationGenerate', {
           type: 'started',
           tempRecordId,
           config: op.input as Record<string, unknown>,
+          taskLabel,
+          opPath: op.path,
         })
       }
     }

     const handleCreationGenerateSuccess = (
       detail: CreationRecordItem,
       id: number,
     ) => {
       if (condition && (detail || id)) {
         creationGenerateEmitter.emit('creationGenerate', {
           type: 'success',
           tempRecordId,
           detail,
           id,
+          taskLabel,
+          opPath: op.path,
         })
       }
     }

     const handleCreationGenerateFailed = () => {
       if (condition) {
         creationGenerateEmitter.emit('creationGenerate', {
           type: 'failed',
           tempRecordId,
+          taskLabel,
+          opPath: op.path,
         })
       }
     }
```

### 修改内容说明

#### `taskLabel`

作用：

- 基于现有 path 映射得到当前任务的业务名称
- 给 toast 文案、日志、后续调试统一提供任务描述

#### `opPath`

作用：

- 标记当前任务是哪一个 tRPC mutation 发起的
- 后续如果要做白名单、黑名单过滤，可以直接用

### 决策理由

这是当前最合适的单点接入位置，因为：

- 所有受支持任务都会经过这里
- 这里已经有 path 映射表
- 这里是“请求刚发起”的统一入口
- 不需要每个生成页单独做接入

### 涉及对象说明

- `generationTaskLink`
  - tRPC 客户端统一拦截器
  - 用于在请求前后插入前端逻辑
- `condition`
  - 当前请求是否属于支持的生成任务
- `handleCreationGenerateStarted`
  - 任务开始时发出事件
- `handleCreationGenerateSuccess`
  - 任务请求成功返回 recordId 后发出事件
- `handleCreationGenerateFailed`
  - 请求报错时发出失败事件

---

## 3. 新增 `web/src/pages/pollo.ai/_components/PolloGlobalEvent/events/useGenerationResultToast.storage.ts`

### 修改目标

把待提醒任务的持久化、恢复、终态标记、移除，以及排除路由逻辑单独封装。

### 预期 diff

```diff
+export interface PendingGenerationToastTask {
+  recordId: number
+  taskLabel: string
+  opPath?: string
+  createdAt: number
+  finalStatus: 'succeed' | 'failed' | null
+  notified: boolean
+}
+
+const STORAGE_KEY = 'pollo-generation-result-toast-pending'
+
+function readTasks(): PendingGenerationToastTask[] {
+  if (typeof window === 'undefined') return []
+  try {
+    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
+  } catch {
+    return []
+  }
+}
+
+function writeTasks(tasks: PendingGenerationToastTask[]) {
+  if (typeof window === 'undefined') return
+  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
+}
+
+export function getPendingTasks() {
+  return readTasks()
+}
+
+export function appendPendingTask(task: PendingGenerationToastTask) {
+  const tasks = readTasks()
+  const exists = tasks.some((item) => item.recordId === task.recordId)
+  if (exists) return
+  writeTasks([task, ...tasks])
+}
+
+export function markTaskCompleted(
+  recordId: number,
+  finalStatus: 'succeed' | 'failed',
+) {
+  const tasks = readTasks()
+  let nextTask: PendingGenerationToastTask | null = null
+
+  const nextTasks = tasks.map((task) => {
+    if (task.recordId !== recordId) return task
+    nextTask = {
+      ...task,
+      finalStatus,
+    }
+    return nextTask
+  })
+
+  writeTasks(nextTasks)
+  return nextTask
+}
+
+export function removePendingTask(
+  recordId: number,
+  finalStatus?: 'succeed' | 'failed' | null,
+) {
+  const tasks = readTasks()
+  const nextTasks = tasks.filter((task) => {
+    if (task.recordId !== recordId) return true
+    if (!finalStatus) return false
+    return task.finalStatus !== finalStatus
+  })
+  writeTasks(nextTasks)
+}
+
+export function shouldSkipGenerationToastByPath(path: string) {
+  const purePath = path.split('?')[0]
+  if (purePath === '/generate') return true
+  if (purePath.startsWith('/ai-video-agent')) return true
+  return false
+}
```

### 修改内容说明

#### `PendingGenerationToastTask`

作用：

- 表示本地持久化的一条“待提醒生成任务”

字段说明：

- `recordId`
  - 任务唯一标识，用于查询详情
- `taskLabel`
  - 用于 toast 文案展示
- `opPath`
  - 任务来源 tRPC 路径
- `createdAt`
  - 记录任务创建时间，后续可用于清理策略
- `finalStatus`
  - 终态，未完成时为 `null`
- `notified`
  - 是否已经弹过提醒

#### `appendPendingTask`

作用：

- 新生成任务进入待提醒队列
- 通过 `recordId` 去重，避免重复入队

#### `markTaskCompleted`

作用：

- 在轮询拿到终态后，将任务标记为 `succeed` 或 `failed`

#### `removePendingTask`

作用：

- 任务已经提醒完成后，从本地队列中清理

#### `shouldSkipGenerationToastByPath`

作用：

- 统一判断当前页面是否是排除路由
- 目前排除：
  - `/generate`
  - `/ai-video-agent` 路由家族

### 决策理由

这部分如果直接写在 hook 中，会把业务逻辑和存储逻辑混在一起，后期很难维护。  
拆到独立的 storage/util 文件，有以下好处：

- 逻辑职责更清晰
- 单元测试更容易写
- hook 内只保留“监听、轮询、弹提醒”主流程
- 后续扩展清理策略、容量限制时更方便

### 涉及对象说明

- `localStorage`
  - 用于跨刷新保留任务提醒队列
- `STORAGE_KEY`
  - 本地存储唯一 key
- `readTasks` / `writeTasks`
  - 统一处理存储读写
- `shouldSkipGenerationToastByPath`
  - 路由级排除开关

---

## 4. 新增 `web/src/pages/pollo.ai/_components/PolloGlobalEvent/events/useGenerationResultToast.ts`

### 修改目标

实现本次需求的核心全局监听 hook。

### 预期 diff

```diff
+import { useAntdContext } from '@/contexts/AntdContext/hooks'
+import { creationGenerateEmitter } from '@/pages/pollo.ai/_components/Creations/events'
+import { api } from '@/utils/api'
+import { useMemoizedFn } from 'ahooks'
+import { useRouter } from 'next/router'
+
+import {
+  appendPendingTask,
+  getPendingTasks,
+  markTaskCompleted,
+  removePendingTask,
+  shouldSkipGenerationToastByPath,
+  type PendingGenerationToastTask,
+} from './useGenerationResultToast.storage'
+
+const POLLING_INTERVAL = 5000
+
+export function useGenerationResultToast() {
+  const router = useRouter()
+  const { message } = useAntdContext()
+  const apiCtx = api.useUtils()
+  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
+  const pollingRef = useRef(false)
+
+  const openResultToast = useMemoizedFn((task: PendingGenerationToastTask) => {
+    if (shouldSkipGenerationToastByPath(router.asPath)) {
+      return
+    }
+
+    const isSuccess = task.finalStatus === 'succeed'
+    const content = `${task.taskLabel} ${isSuccess ? 'completed' : 'failed'}`
+
+    message.open({
+      key: `${task.recordId}-${task.finalStatus}`,
+      type: isSuccess ? 'success' : 'error',
+      duration: 5,
+      content,
+      onClick: () => {
+        router.push('/generate')
+      },
+    })
+  })
+
+  const checkPendingTasks = useMemoizedFn(async () => {
+    if (pollingRef.current) return
+    pollingRef.current = true
+
+    try {
+      const tasks = getPendingTasks()
+      const waitingTasks = tasks.filter((task) => !task.finalStatus)
+
+      await Promise.all(
+        waitingTasks.map(async (task) => {
+          const detail = await apiCtx.generation.queryRecordDetail.fetch({
+            id: task.recordId,
+          })
+
+          const status = detail?.status
+          if (status === 'succeed' || status === 'failed') {
+            const nextTask = markTaskCompleted(task.recordId, status)
+            if (!nextTask) return
+
+            if (!nextTask.notified && !shouldSkipGenerationToastByPath(router.asPath)) {
+              openResultToast(nextTask)
+              removePendingTask(nextTask.recordId, nextTask.finalStatus)
+            }
+          }
+        }),
+      )
+    } finally {
+      pollingRef.current = false
+      timerRef.current = setTimeout(checkPendingTasks, POLLING_INTERVAL)
+    }
+  })
+
+  useEffect(() => {
+    const unbind = creationGenerateEmitter.on('creationGenerate', (payload) => {
+      if (payload.type !== 'success' || !payload.id) return
+
+      appendPendingTask({
+        recordId: payload.id,
+        taskLabel: payload.taskLabel || 'Generation',
+        opPath: payload.opPath,
+        createdAt: Date.now(),
+        finalStatus: null,
+        notified: false,
+      })
+
+      checkPendingTasks()
+    })
+
+    checkPendingTasks()
+
+    return () => {
+      unbind()
+      if (timerRef.current) {
+        clearTimeout(timerRef.current)
+      }
+    }
+  }, [checkPendingTasks])
+
+  useEffect(() => {
+    const completedTasks = getPendingTasks().filter(
+      (task) => !!task.finalStatus && !task.notified,
+    )
+
+    completedTasks.forEach((task) => {
+      if (shouldSkipGenerationToastByPath(router.asPath)) return
+      openResultToast(task)
+      removePendingTask(task.recordId, task.finalStatus)
+    })
+  }, [router.asPath, openResultToast])
+}
```

### 修改内容说明

#### 监听 `creationGenerateEmitter`

作用：

- 捕获任务已经成功创建、拿到 `recordId` 的时机
- 只有拿到 `recordId` 才能进入后续轮询

#### `appendPendingTask`

作用：

- 将本次任务保存到本地 pending 队列
- 为刷新恢复做准备

#### `checkPendingTasks`

作用：

- 全局轮询所有未终态任务
- 调用 `queryRecordDetail` 获取最新状态
- 一旦进入终态，触发提醒逻辑

#### `openResultToast`

作用：

- 用统一入口打开 antd toast
- 统一文案、样式类型、点击跳转行为

#### 第二个 `useEffect`

作用：

- 处理“排除页不弹，但离开后要补弹”的场景
- 即：如果任务已完成，但当前在 `/generate` 或 agent 页，则先保留；进入普通页后补提示一次

### 决策理由

这是全局提醒逻辑最合理的承载位置，因为：

- `PolloGlobalEvent` 已经是全局无 UI 事件挂载层
- 页面切换时它不会销毁
- 它与具体生成页解耦，不会污染页面业务代码
- 逻辑集中，后续更容易扩展为通知中心、未读数等能力

### 涉及对象说明

- `useGenerationResultToast`
  - 本次新增的全局生成结果提醒 hook
- `useAntdContext`
  - 获取项目规定的 antd message 实例
- `message.open`
  - 用于打开 toast
- `apiCtx.generation.queryRecordDetail.fetch`
  - 查询任务状态的核心接口
- `router.push('/generate')`
  - toast 点击跳转
- `timerRef`
  - 保存轮询定时器
- `pollingRef`
  - 防止轮询重入

---

## 5. `web/src/pages/pollo.ai/_components/PolloGlobalEvent/events/index.ts`

### 修改目标

把奖励事件和生成结果提醒统一聚合到一个全局入口中。

### 预期 diff

```diff
 import { globalEventEmitter } from '@/events'
 import { usePlanCloseRewardCb } from '@/pages/pollo.ai/_hooks/usePlanCloseRewardCb'
 import { useMemoizedFn } from 'ahooks'
+import { useGenerationResultToast } from './useGenerationResultToast'

 export function useRewardsEvent() {
   const { callback } = usePlanCloseRewardCb()

   const handleRewardsEvent = useMemoizedFn(() => {
     callback()
   })

   useEffect(() => {
     globalEventEmitter.on('upgradePlanModalCloseForRewards', handleRewardsEvent)
   }, [handleRewardsEvent])
 }
+
+export function usePolloGlobalEvents() {
+  useRewardsEvent()
+  useGenerationResultToast()
+}
```

### 修改内容说明

#### `usePolloGlobalEvents`

作用：

- 作为 `PolloGlobalEvent` 的统一事件聚合入口
- 后续所有全局监听型 hook 都放在这里接入

### 决策理由

当前已有 `useRewardsEvent`，继续沿着这个模式扩展最符合现有结构。  
不建议在 `PolloGlobalEvent/index.tsx` 直接堆多个 hook 调用，否则组件会逐步变成逻辑拼盘。

### 涉及对象说明

- `useRewardsEvent`
  - 现有奖励相关全局事件 hook
- `useGenerationResultToast`
  - 本次新增生成结果提醒 hook
- `usePolloGlobalEvents`
  - 新的统一聚合入口

---

## 6. `web/src/pages/pollo.ai/_components/PolloGlobalEvent/index.tsx`

### 修改目标

将 `PolloGlobalEvent` 从单一奖励监听升级为统一的全局事件挂载组件。

### 预期 diff

```diff
-import { useRewardsEvent } from './events'
+import { usePolloGlobalEvents } from './events'

 export function PolloGlobalEvent() {
-  useRewardsEvent()
+  usePolloGlobalEvents()
   return null
 }
```

### 修改内容说明

#### `usePolloGlobalEvents`

作用：

- 替代原来的单一 `useRewardsEvent`
- 统一挂载所有全局事件监听逻辑

### 决策理由

`PolloGlobalEvent` 已经在根布局层使用，是现成的全局挂载点。  
继续复用这个组件，比新增另一个平行的全局组件更干净。

### 涉及对象说明

- `PolloGlobalEvent`
  - 全站无 UI 的全局事件组件
- `usePolloGlobalEvents`
  - 全局事件统一注册入口

---

## 7. `web/src/pages/pollo.ai/_layout/layouts/RootLayout/index.tsx`

### 修改目标

本文件原则上不需要实质新增代码，但必须确认全局提醒继续挂载在此层。

### 现状说明

```tsx
<PolloGlobalEvent />
```

已经存在于 `RootLayout` 底部。

### 作用说明

这意味着：

- 页面切换时监听器不会被页面级组件销毁
- 所有 `pollo.ai` 页面共享同一套全局提醒逻辑
- 能支撑“离开发起任务页后仍可收到提醒”的需求

### 决策理由

如果把提醒逻辑放在具体生成页、Creations 区块、或 `useRecordsStatusMonitor` 里，会有这些问题：

- 页面切走就销毁
- 跨刷新恢复困难
- 逻辑在多个页面重复实现
- 无法覆盖所有统一生成入口

所以必须挂在全站常驻层，而 `RootLayout -> PolloGlobalEvent` 就是现有最合适的位置。

---

## 全局修改点的功能解释与理由汇总

### 为什么不放在 `useRecordsStatusMonitor`

原因：

- 它是“页面内记录状态轮询 hook”
- 它依赖页面把 `records` 传进去
- 页面切换后就不会继续生效

而本需求要求：

- 离开发起任务页后仍可提醒
- 刷新后仍可恢复提醒

所以不适合用它作为全局提醒主入口。

### 为什么不在每个生成页单独实现

原因：

- 会把逻辑拆散到多个页面
- 页面切走后监听器销毁
- 新页面接入成本高
- toast 行为容易不一致

统一挂在全局层，可以保证：

- 单点维护
- 行为一致
- 新任务类型自动继承已有链路

### 为什么要使用 `localStorage`

原因：

- 需求明确要求刷新后仍保留提醒
- 内存变量刷新会丢
- `sessionStorage` 只适合同标签页刷新，扩展性不如 `localStorage`

### 为什么使用 `message.open` 而不是 `notification.open`

原因：

- 需求明确是 antd toast
- `message.open` 更接近轻量级 toast 语义
- 它也支持 `onClick`
- 交互更轻，不会像通知卡片那样过重

### 为什么 `generationTaskLink` 是最佳接入点

原因：

- 所有统一生成 mutation 都经过它
- 它已经维护了生成任务 path 映射
- 它天然知道何时开始、何时返回成功、何时报错
- 不需要各页面重复埋事件

---

## 实现后重点验证场景

```diff
+ 1. 在 image-to-video 发起任务，停留当前页，完成后弹 toast
+ 2. 在 image-to-video 发起任务，切去其他普通页面，完成后弹 toast
+ 3. 发起任务后刷新页面，完成后仍弹 toast
+ 4. 当前位于 /generate 时，不弹 toast
+ 5. 当前位于 ai-video-agent 路由时，不弹 toast
+ 6. 从排除页离开后，已完成未提示任务补弹一次
+ 7. 成功任务弹 success toast
+ 8. 失败任务弹 error toast
+ 9. 点击 toast 后固定跳转 /generate
+ 10. 同一 recordId 的同一终态只提醒一次
```

---

## 下一步

在退出 Plan Mode 后，按以下顺序实施：

1. 新增本地 pending 队列存储模块
2. 新增全局 `useGenerationResultToast` hook
3. 扩展 `CreationGeneratePayload`
4. 扩展 `generationTaskLink` 事件载荷
5. 聚合到 `PolloGlobalEvent`
6. 做功能验证与去重验证

---

---

## 补充：用户点击生成 video 到轮询生成消息提醒的函数调用链路

下面链路以 `image-to-video` 页面为主线，其他接入 `handleInFlowGenerate + generationTaskLink` 的视频生成页调用模式基本一致。

- 起点是 `image-to-video` 页的 `Form.onFinishAndTransformed`。
- `handleInFlowGenerate` 负责统一执行创建请求。
- `generationTaskLink` 负责把创建请求转换成前端统一生成事件。
- `useGenerationResultToast` 负责登记待提醒任务、轮询 `queryRecordDetail`、在终态时弹出 toast。
- toast 点击后统一跳转 `/generate`。

```text

image-to-video/_blocks/GeneratorForm/index:Form.onFinishAndTransformed
  /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/image-to-video/_blocks/GeneratorForm/index.tsx:238
  -> _hooks/useInFlowGenerate:handleInFlowGenerate
     /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_hooks/useInFlowGenerate.ts:70
  -> image-to-video/_blocks/GeneratorForm/index:createVideo
     /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/image-to-video/_blocks/GeneratorForm/index.tsx:204
  -> utils/api:api.createTRPCNext.links
     /Users/a111111/code/ai-video-collection/web/src/utils/api.ts:168
  -> utils/generation-task-link:generationTaskLink
     /Users/a111111/code/ai-video-collection/web/src/utils/generation-task-link.ts:114
  -> utils/generation-task-link:handleCreationGenerateStarted
     /Users/a111111/code/ai-video-collection/web/src/utils/generation-task-link.ts:146
  -> _components/Creations/events:creationGenerateEmitter.emit
     /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/Creations/events.ts:31
  -> utils/generation-task-link:handleCreationGenerateSuccess
     /Users/a111111/code/ai-video-collection/web/src/utils/generation-task-link.ts:160


  -> _components/PolloGlobalEvent/index:PolloGlobalEvent
     /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/PolloGlobalEvent/index.tsx:4
  -> _components/PolloGlobalEvent/events/index:usePolloGlobalEvents
     /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/PolloGlobalEvent/events/index.ts:23

  -> _components/PolloGlobalEvent/events/useGenerationResultToast:useGenerationResultToast
     /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/PolloGlobalEvent/events/useGenerationResultToast.ts:21
  -> _components/PolloGlobalEvent/events/useGenerationResultToast.storage:appendPendingGenerationToastTask
     /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/PolloGlobalEvent/events/useGenerationResultToast.storage.ts:42
  -> _components/PolloGlobalEvent/events/useGenerationResultToast:pollPendingTasks
     /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/PolloGlobalEvent/events/useGenerationResultToast.ts:122
  -> _components/PolloGlobalEvent/events/useGenerationResultToast:apiCtx.generation.queryRecordDetail.fetch
     /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/PolloGlobalEvent/events/useGenerationResultToast.ts:145
  -> _components/PolloGlobalEvent/events/useGenerationResultToast.storage:markPendingGenerationToastTaskCompleted
     /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/PolloGlobalEvent/events/useGenerationResultToast.storage.ts:57
  -> _components/PolloGlobalEvent/events/useGenerationResultToast:openResultToast
     /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/PolloGlobalEvent/events/useGenerationResultToast.ts:50
  -> _components/PolloGlobalEvent/events/useGenerationResultToast:message.open
     /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/PolloGlobalEvent/events/useGenerationResultToast.ts:65
  -> _components/PolloGlobalEvent/events/useGenerationResultToast:router.push('/generate')
     /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/PolloGlobalEvent/events/useGenerationResultToast.ts:71
```

## 涉及链接

• 目前接入了 handleInFlowGenerate + generationTaskLink 这条链路的页面/功能，按入口文件看主要有这些：

- image-to-video
- text-to-video
- video-to-video
- template 生成页
- tool 通用表单页
- app 首页视频编辑表单
- consistent-character-video
- ai-shorts
- ai-animation-generator
- use-cases
- photo-effects
- ai-image-generator
- image-to-image-ai
- ChatEntry 视频生成
- ChatEntry 图片生成
- canvas image-to-video form
- 媒体工具 BgRemove
- 媒体工具 Uncrop
- 媒体工具 ObjectRemover
- 媒体工具 Inpaint
- 媒体工具 AiBackground
- 媒体工具 Upscale

  补充两点：

- handleInFlowGenerate 的统一入口在 useInFlowGenerate.ts。
- generationTaskLink 的实际拦截范围由 generation-task-link.ts 里那几组 path 决定，所以“页面调用了 handleInFlowGenerate”不等于一定会进入这条链，只有调用到这些受支持的
    create mutation 才会被拦截。

## 创建task监听 createTRPCNext links

createTRPCNext 里的 links 可以理解成“tRPC 客户端请求中间件链”。

  作用是：每次前端调用 api.xxx.useMutation() 或 api.xxx.useQuery() 发请求时，请求不会直接去后端，而是会按 links 数组的顺序，依次经过这些拦截层。每一层都可以：

- 在请求发出前做处理
- 在响应回来后做处理
- 拦截错误
- 追加日志、事件、埋点、鉴权头、重试、分流等能力

  你们项目里的配置在 api.ts:168：

  links: [
    generationTaskLink,
    eventLink,
    throwMessageLink,
    loggerLink(),
    splitLink(...)
  ]

  这几层大致作用是：

- generationTaskLink:114
    识别“生成类请求”，在 started/success/failed 时发前端事件，供 Creations 和全局 toast 使用
- eventLink
    把某些 mutation/query 的成功结果转成全局事件广播
- throwMessageLink
    统一处理 tRPC 错误，决定是否弹全局错误提示
- loggerLink()
    记录请求日志
- splitLink(...)
    决定最后请求怎么真正发出去
    例如走 httpLink 还是 httpBatchLink

---

## 新方案：`useGenerationResultToast`（不考虑刷新保留 / 不使用本地缓存）

### 设计说明

- 不再使用 `localStorage`
- 不再尝试刷新页面后恢复待提醒任务
- 待轮询任务仅保存在当前会话内存中
- 如果任务在 `/generate` 或 `ai-video-agent` 页面完成，则先保存在内存队列中，离开排除页后补发 toast
- 如果整页刷新，内存任务队列会丢失，这是新方案的预期行为

### 新版代码

```ts
import { useAntdContext } from '@/contexts/AntdContext/hooks'
import { useSessionInfo } from '@/contexts/AuthContext/hooks/sessionInfo'
import { creationGenerateEmitter } from '@/pages/pollo.ai/_components/Creations/events'
import { api } from '@/utils/api'
import { useLingui } from '@lingui/react/macro'
import { useMemoizedFn } from 'ahooks'
import { useRouter } from 'next/router'

interface PendingGenerationToastTask {
  recordId: number
  taskLabel: string
  finalStatus?: 'succeed' | 'failed'
}

const POLLING_INTERVAL = 5000

function shouldSkipGenerationToastByPath(path: string) {
  const purePath = path.split('?')[0]
  return purePath === '/generate' || purePath.startsWith('/ai-video-agent')
}

export function useGenerationResultToast() {
  const router = useRouter()
  const apiCtx = api.useUtils()
  const { message } = useAntdContext()
  const { t } = useLingui()
  const sessionInfo = useSessionInfo()
  const isAuth = sessionInfo.sessionAuthenticated
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollingRef = useRef(false)
  const pendingTasksRef = useRef<Map<number, PendingGenerationToastTask>>(
    new Map(),
  )
  const completedTasksRef = useRef<Map<number, PendingGenerationToastTask>>(
    new Map(),
  )
  const pollPendingTasksRef = useRef<() => Promise<void>>(async () => {})

  const clearPollingTimer = useMemoizedFn(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  })

  const openResultToast = useMemoizedFn(
    (params: {
      recordId: number
      taskLabel: string
      finalStatus: 'succeed' | 'failed'
    }) => {
      if (shouldSkipGenerationToastByPath(router.asPath)) {
        return false
      }

      const isSuccess = params.finalStatus === 'succeed'
      message.open({
        key: `${params.recordId}-${params.finalStatus}`,
        type: isSuccess ? 'success' : 'error',
        duration: 3,
        content: `${params.taskLabel} ${isSuccess ? t`completed` : t`failed`}`,
        onClick: () => {
          router.push('/generate')
        },
      })

      return true
    },
  )

  const scheduleNextPolling = useMemoizedFn(() => {
    clearPollingTimer()

    if (!pendingTasksRef.current.size) {
      return
    }

    timerRef.current = setTimeout(() => {
      void pollPendingTasksRef.current()
    }, POLLING_INTERVAL)
  })

  const flushCompletedTasks = useMemoizedFn(() => {
    if (shouldSkipGenerationToastByPath(router.asPath)) {
      return
    }

    for (const task of completedTasksRef.current.values()) {
      if (!task.finalStatus) {
        continue
      }

      const displayed = openResultToast({
        recordId: task.recordId,
        taskLabel: task.taskLabel,
        finalStatus: task.finalStatus,
      })

      if (displayed) {
        completedTasksRef.current.delete(task.recordId)
      }
    }
  })

  const pollPendingTasks = useMemoizedFn(async () => {
    if (!isAuth || pollingRef.current) {
      return
    }

    const pendingTasks = Array.from(pendingTasksRef.current.values())
    if (!pendingTasks.length) {
      clearPollingTimer()
      flushCompletedTasks()
      return
    }

    pollingRef.current = true

    try {
      await Promise.all(
        pendingTasks.map(async (task) => {
          try {
            const detail = await apiCtx.generation.queryRecordDetail.fetch({
              id: task.recordId,
            })

            const status = detail?.status
            if (status !== 'succeed' && status !== 'failed') {
              return
            }

            pendingTasksRef.current.delete(task.recordId)
            const completedTask = {
              ...task,
              finalStatus: status,
            } satisfies PendingGenerationToastTask

            const displayed = openResultToast({
              recordId: completedTask.recordId,
              taskLabel: completedTask.taskLabel,
              finalStatus: completedTask.finalStatus,
            })

            if (!displayed) {
              completedTasksRef.current.set(task.recordId, completedTask)
            }
          } catch {
            // 忽略瞬时查询失败，保留任务等待下一轮轮询。
          }
        }),
      )
    } finally {
      pollingRef.current = false
      flushCompletedTasks()
      scheduleNextPolling()
    }
  })
  pollPendingTasksRef.current = pollPendingTasks

  useEffect(() => {
    if (!isAuth) {
      clearPollingTimer()
      pendingTasksRef.current.clear()
      completedTasksRef.current.clear()
      return
    }

    const unbind = creationGenerateEmitter.on('creationGenerate', (payload) => {
      if (payload.type !== 'success' || !payload.id) {
        return
      }

      pendingTasksRef.current.set(payload.id, {
        recordId: payload.id,
        taskLabel: payload.taskLabel || 'Generation',
      })

      void pollPendingTasks()
    })

    flushCompletedTasks()
    void pollPendingTasks()

    return () => {
      unbind()
      clearPollingTimer()
    }
  }, [clearPollingTimer, flushCompletedTasks, isAuth, pollPendingTasks])

  useEffect(() => {
    if (!isAuth) {
      return
    }

    flushCompletedTasks()
  }, [flushCompletedTasks, isAuth, router.asPath])
}
```
