# CreditsInfo 下拉面板改造分析

## 设计稿概览

- Figma 节点 **93254:40458** — "额度介绍" 面板
- 改造范围：**Add More 按钮上方的内容区域**（按钮及签到按钮保持不变）

### Figma 目标结构

```
┌─────────────────────────────────────────────┐
│ Available Credits          🔥 860           │  ← 标题行 + 总积分
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ {planName}      🔥 3/30 Credits Used   │ │  ← planName 动态标题 + 进度条
│ │ ██████████████████████░░░░░░░░░░░░░░░░░ │ │  ← Unlimited 时隐藏进度条
│ └─────────────────────────────────────────┘ │
│ Add-on Credits                    🔥 300    │  ← Add-on 明细行
│ Free Credits                      🔥 60     │  ← Free 明细行
├─────────────────────────────────────────────┤
│            [ Add More ]                     │  ← 保持不变
│        [ Sign in & Claim ]                  │  ← 保持不变
└─────────────────────────────────────────────┘
```

### planName 卡片状态

| 条件                | 左侧标题   | 右侧数值（creditsValue）                        | 进度条 |
| ------------------- | ---------- | ------------------------------------------------ | ------ |
| 有激活套餐 + 无限制 | `planName` | `t\`Unlimited\``                                 | 隐藏   |
| 有激活套餐          | `planName` | `t\`${planUseCount}/${planTotalCount} Credits Used\`` | 显示   |
| 无激活套餐          | `"Free"`   | `t\`${planUseCount}/${planTotalCount} Credits Used\``（即 `0/0 Credits Used`） | 显示   |

> creditsValue 仅对应 `planUseCount / planTotalCount`，"Credits Used" 文案已合入 creditsValue 的 `t` 模板中统一翻译。
> 进度条始终使用 `planUseCount / planTotalCount`。

## 改造项列表

| #   | 改造名称                                      | 涉及文件                                                        | 差异类型 |
| --- | --------------------------------------------- | --------------------------------------------------------------- | -------- |
| 1   | 标题行替换为 Available Credits + 总积分       | ContentWrapper/index.tsx                                        | 布局变动 |
| 2   | CreditsCard 替换为 planName 卡片 + 进度条     | ContentWrapper/index.tsx                                        | 布局变动 |
| 3   | 新增 Add-on Credits 行                        | ContentWrapper/index.tsx                                        | 新增元素 |
| 4   | 新增 Free Credits 行                          | ContentWrapper/index.tsx                                        | 新增元素 |
| 5   | 清理不再使用的变量和 import                   | ContentWrapper/index.tsx                                        | 代码清理 |
| 6   | 容器宽度统一为 312px，删除 constants.ts       | ContentWrapper/index.tsx, constants.ts, DynamicContent/index.tsx | 代码清理 |

## 保留项（不修改）

- `CreditsCard` 组件文件保持不变（不删除）
- `usePlanLabels`、`useLingui`、`plan` 相关变量全部保留
- `planName` useMemo 逻辑保留

## 改造详情

### ContentWrapper/index.tsx

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/CreditsInfo/_blocks/DynamicContent/ContentWrapper/index.tsx

  // --- 改造 #5: import 调整 ---
  import { usePlanLabels } from '@/contexts/SiteSpecificContext/hooks/sub-log/planLabels'  // 保留
  import { Trans, useLingui } from '@lingui/react/macro'                                   // 保留
- import CreditsCard from '../CreditsCard'                         // 不再使用（组件文件保留）
- import { CREDITS_CARD_STYLES } from './constants'                // 删除，宽度统一为 312px
+ import UsageProgress from '@/pages/pollo.ai/app/account/_blocks/UsageProgress'  // 新增进度条

  // --- 改造 #5+#6: 变量清理 ---
- const cardStyles = useMemo(...)                                  // L41-47 删除
- const { endTime: freeRewardEndTime } = freeRewardUsage           // 不再需要 endTime
- const { creditsPeriodText, planName: planNameText } = usePlanLabels()
+ const { planName: planNameText } = usePlanLabels()               // 只需 planName

  // --- 改造 #5: creditsValue 简化 ---
  const creditsValue = useMemo(() => {
    if (hasActivePlan && creditsPlanIsUnlimited) {
      return t`Unlimited`
    }
-   if (hasActivePlan) {
-     return `${planUseCount}/${planTotalCount}`
-   }
-   return `${nonPlanUseCount}/${nonPlanTotalCount}`
+   return t`${planUseCount}/${planTotalCount} Credits Used`       // 统一用 plan 数据 + 翻译
- }, [hasActivePlan, creditsPlanIsUnlimited, planUseCount, planTotalCount, nonPlanUseCount, nonPlanTotalCount, t])
+ }, [hasActivePlan, creditsPlanIsUnlimited, planUseCount, planTotalCount, t])

  // --- 改造 #6: 容器宽度统一为 312px ---
  <div
    className={cls`
-      px-1 py-2
-     ${cardStyles.container}                                      // 移除动态宽度
+      px-1 py-2 md:w-[312px]                                     // 固定宽度 312px
    `}
    data-widget-name={trackComponentName.framework_widget.value.credits.name}
  >

  // --- 改造 #1: 标题行替换 ---
-   <div className='mb-3 text-lg'>{planName}</div>                // L85 旧标题
+   <div className='flex items-center justify-between'>
+     <span className='text-f-text text-base font-semibold'>
+       <Trans>Available Credits</Trans>
+     </span>
+     <div className='flex items-center gap-0.5'>
+       <span className='i-cus--pol-credits size-4' />
+       <span className='text-f-text text-base font-semibold'>
+         {countInfo.remainingCredits}
+       </span>
+     </div>
+   </div>

  // --- 改造 #2: planName 卡片 + 条件进度条 ---
-   <CreditsCard ... />
-   {hasFreeRewardUsage && (<CreditsCard ... />)}
+   <div className='bg-f-bg-layout mt-4 flex flex-col gap-1 rounded-lg p-3'>
+     <div className='flex items-center justify-between'>
+       <span className='text-f-text-secondary text-xs'>{planName}</span>
+       <span className='text-f-text-secondary flex items-center gap-0.5 text-xs'>
+         <span className='i-cus--pol-credits size-4' />
+         {creditsValue}
+       </span>
+     </div>
+     {!(hasActivePlan && creditsPlanIsUnlimited) && (
+       <UsageProgress
+         useWords={planUseCount}
+         totalWords={planTotalCount}
+         size={['100%', 10]}
+         trailColor='var(--f-other-4)'
+         strokeColor='var(--f-text-tertiary)'
+       />
+     )}
+   </div>

  // --- 改造 #3: Add-on Credits 行 ---
+   <div className='mt-4 flex items-center justify-between'>
+     <span className='text-f-text-secondary text-xs'>
+       <Trans>Add-on Credits</Trans>
+     </span>
+     <span className='text-f-text-secondary flex items-center gap-0.5 text-xs'>
+       <span className='i-cus--pol-credits size-4' />
+       {nonPlanTotalCount - nonPlanUseCount}
+     </span>
+   </div>

  // --- 改造 #4: Free Credits 行 ---
+   <div className='mt-4 flex items-center justify-between'>
+     <span className='text-f-text-secondary text-xs'>
+       <Trans>Free Credits</Trans>
+     </span>
+     <span className='text-f-text-secondary flex items-center gap-0.5 text-xs'>
+       <span className='i-cus--pol-credits size-4' />
+       {hasFreeRewardUsage ? freeRewardTotalCount - freeRewardUseCount : 0}
+     </span>
+   </div>

  // Button 和 CheckInCreditsButton 保持不变
```

### DynamicContent/index.tsx

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/CreditsInfo/_blocks/DynamicContent/index.tsx

  // --- 改造 #6: loading 占位宽度同步 ---
- <div className='flex h-[222px] w-[232px] items-center justify-center md:w-[280px]'>
+ <div className='flex h-[222px] w-[232px] items-center justify-center md:w-[312px]'>
```

### constants.ts — 删除文件

```diff
// /Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/_components/CreditsInfo/_blocks/DynamicContent/ContentWrapper/constants.ts
// 整个文件删除，宽度已统一内联为 md:w-[312px]
```

## 样式映射参考

| Figma 颜色值                          | figma-theme 变量     | Tailwind class          |
| ------------------------------------- | -------------------- | ----------------------- |
| `#FFFFFF`                             | `--f-text`           | `text-f-text`           |
| `rgba(255,255,255,0.65)`              | `--f-text-secondary` | `text-f-text-secondary` |
| `rgba(255,255,255,0.04)` (card bg)    | `--f-bg-layout`      | `bg-f-bg-layout`        |
| `rgba(255,255,255,0.08)` (进度条底色) | `--f-other-4`        | —                       |
| `rgba(255,255,255,0.65)` (进度条填充) | `--f-text-tertiary`  | —                       |

## 数据字段映射

| Figma 展示           | 数据来源                                                                              |
| -------------------- | ------------------------------------------------------------------------------------- |
| 总积分 "860"         | `countInfo.remainingCredits`                                                          |
| planName 卡片右侧    | `creditsValue`：Unlimited 或 `t\`${planUseCount}/${planTotalCount} Credits Used\``    |
| planName 卡片进度条   | `planUseCount / planTotalCount`                                                       |
| Add-on Credits 剩余  | `nonPlanTotalCount - nonPlanUseCount`                                                 |
| Free Credits 剩余    | `hasFreeRewardUsage ? freeRewardTotalCount - freeRewardUseCount : 0`                  |

## 现有组件复用

进度条使用 `UsageProgress` 组件（基于 antd `Progress`），通过自定义 `trailColor` 和 `strokeColor` 匹配 Figma 设计。Unlimited 状态下隐藏进度条。
