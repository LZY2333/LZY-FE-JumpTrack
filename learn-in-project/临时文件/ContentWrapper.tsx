import { trackComponentName } from '@/coco-react/analytics'
import { useSiteSpecificContext } from '@/contexts/SiteSpecificContext'
import { usePlanLabels } from '@/contexts/SiteSpecificContext/hooks/sub-log/planLabels'
import UsageProgress from '@/pages/pollo.ai/app/account/_blocks/UsageProgress'
import { Trans, useLingui } from '@lingui/react/macro'
import { Button } from 'antd'

import CheckInCreditsButton from '../../CheckInCreditsButton'

export interface ContextWrapperProps {
  onAddMore?: (e: React.MouseEvent) => void
  onOpenChange?: (value: boolean) => void
}

function ContextWrapper(props: ContextWrapperProps) {
  const { onAddMore, onOpenChange } = props

  const { t } = useLingui()
  const { plan, usage } = useSiteSpecificContext()

  const { hasActivePlan, creditsPlanIsUnlimited } = plan
  const { countInfo } = usage
  const {
    planUseCount,
    planTotalCount,
    freeRewardUsage,
    nonPlanTotalCount,
    nonPlanUseCount,
  } = countInfo

  const {
    hasFreeRewardUsage,
    totalCount: freeRewardTotalCount,
    useCount: freeRewardUseCount,
  } = freeRewardUsage

  const { creditsPeriodText: creditsPeriodTextTemp, planName: planNameTemp } =
    usePlanLabels()

  const { planName, creditsPeriodText } = useMemo(() => {
    if (!hasActivePlan) {
      return { planName: t`Free`, creditsPeriodText: t`Free Credits` }
    }
    return { planName: planNameTemp, creditsPeriodText: creditsPeriodTextTemp }
  }, [hasActivePlan, planNameTemp, creditsPeriodTextTemp, t])

  const isUnlimited = hasActivePlan && creditsPlanIsUnlimited

  return (
    <div
      className='px-1 py-2 md:w-[312px]'
      data-widget-name={trackComponentName.framework_widget.value.credits.name}
    >
      <div className='flex items-center justify-between'>
        <span className='text-f-text text-base font-semibold'>{planName}</span>
        <div className='flex items-center gap-0.5'>
          <span className='i-cus--pol-credits size-4' />
          <span className='text-f-text text-base font-semibold'>
            {countInfo.remainingCredits}
          </span>
        </div>
      </div>

      <div className='bg-f-bg-layout mt-4 flex flex-col gap-1 rounded-lg p-3'>
        <div className='flex items-center justify-between'>
          <span className='text-f-text-secondary text-xs'>
            {creditsPeriodText}
          </span>
          <span className='text-f-text-secondary flex items-center gap-0.5 text-xs'>
            <span className='i-cus--pol-credits size-4' />
            {isUnlimited
              ? t`Unlimited`
              : t`${planUseCount}/${planTotalCount} Credits Used`}
          </span>
        </div>
        {!isUnlimited && (
          <UsageProgress
            useWords={planUseCount}
            totalWords={planTotalCount}
            size={['100%', 10]}
            trailColor='var(--f-other-4)'
            strokeColor='var(--f-text-tertiary)'
          />
        )}
      </div>

      <div className='mt-4 flex items-center justify-between'>
        <span className='text-f-text-secondary text-xs'>
          <Trans>Add-on Credits</Trans>
        </span>
        <span className='text-f-text-secondary flex items-center gap-0.5 text-xs'>
          <span className='i-cus--pol-credits size-4' />
          {nonPlanTotalCount - nonPlanUseCount}
        </span>
      </div>

      <div className='mt-4 flex items-center justify-between'>
        <span className='text-f-text-secondary text-xs'>
          <Trans>Free Credits</Trans>
        </span>
        <span className='text-f-text-secondary flex items-center gap-0.5 text-xs'>
          <span className='i-cus--pol-credits size-4' />
          {hasFreeRewardUsage ? freeRewardTotalCount - freeRewardUseCount : 0}
        </span>
      </div>

      <Button
        onClick={onAddMore}
        type='primary'
        className='mt-4 h-10 w-full font-semibold'
        data-button-name={
          trackComponentName.framework_widget.value.credits.value.add_more.name
        }
      >
        <Trans>Add more</Trans>
      </Button>
      <CheckInCreditsButton onOpenChange={onOpenChange} />
    </div>
  )
}

export default ContextWrapper
