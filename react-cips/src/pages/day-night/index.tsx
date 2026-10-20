import { useEffect, useState } from 'react';
import { Alert, Card } from 'antd';
import cn from 'classnames';
import { getDayNightCurrentConfig } from '@/api/dayNight';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import useUserStore from '@/store/useUserStore';
import { DAY_NIGHT_STATUS_LABELS, DayNightStatusEnum } from '@/types/enums';

/** 日夜场页面查询状态 */
interface DayNightPageState {
  /** 当前系统状态 */
  currStatus?: DayNightStatusEnum;
  /** 当前系统日期 */
  currDate?: string;
  /** 下一个系统日期 */
  nextDate?: string;
  /** 查询失败提示 */
  error?: string;
}

const DAY_NIGHT_STATUS_MAP = new Map<string, string>(
  Object.values(DayNightStatusEnum).map((value) => [value, `${value} ${DAY_NIGHT_STATUS_LABELS[value]}`]),
);

/** 日夜场当前状态页 */
const DayNight = () => {
  const userId = useUserStore((state) => state.user?.userId);
  const [pageState, setPageState] = useState<DayNightPageState>({});
  const { currStatus, currDate, nextDate, error } = pageState;
  const currentStatus = currStatus?.trim();

  useEffect(() => {
    setPageState({});
    if (!userId) return;

    let active = true;
    const stopGlobalLoading = startGlobalLoading();
    getDayNightCurrentConfig()
      .then((config) => {
        if (!active) return;
        setPageState({ currStatus: config?.currStatus, currDate: config?.currDate, nextDate: config?.nextDate });
      })
      .catch(() => {
        if (!active) return;
        setPageState({ error: 'Unable to load current status.' });
      })
      .finally(stopGlobalLoading);

    return () => {
      active = false;
      stopGlobalLoading();
    };
  }, [userId]);

  return (
    <Card
      size='small'
      title='Day/Night Cutover'
      className='flex h-full flex-col overflow-hidden'
      classNames={{ body: 'min-h-0 flex-1 overflow-auto text-gray-700' }}
    >
      <div className='mb-4 flex max-w-xs flex-col gap-4 sm:flex-row'>
        <div className='min-w-0 flex-1'>
          <div className='whitespace-nowrap text-sm font-medium text-gray-500'>Current System Date:</div>
          <div className='mt-2 font-mono'>{currDate?.trim() || '--'}</div>
        </div>
        <div className='min-w-0 flex-1'>
          <div className='whitespace-nowrap text-sm font-medium text-gray-500'>Next System Date:</div>
          <div className='mt-2 font-mono'>{nextDate?.trim() || '--'}</div>
        </div>
      </div>
      <section aria-labelledby='day-night-current-status' className='max-w-xs'>
        <h2 id='day-night-current-status' className='m-0 text-sm font-medium text-gray-500'>
          Current Status:
        </h2>
        <div role='status' aria-live='polite' className='sr-only'>
          {error ?? formatDayNightStatus(currStatus)}
        </div>
        {error && <Alert className='mt-3' type='error' showIcon message={error} />}
        {currentStatus && !DAY_NIGHT_STATUS_MAP.has(currentStatus) && (
          <Alert className='mt-3' type='warning' showIcon message={formatDayNightStatus(currStatus)} />
        )}
        <ul className='m-0 mt-3 list-none space-y-1 p-0 text-sm'>
          {Object.values(DayNightStatusEnum).map((status) => (
            <li
              key={status}
              data-day-night-status={status}
              aria-current={status === currentStatus ? 'true' : undefined}
              className={cn('flex items-center gap-3 rounded-md px-3 py-2', {
                'bg-white font-medium shadow ring-1': status === currentStatus,
              })}
            >
              <span className='w-12 shrink-0 font-mono font-medium tracking-wide'>{status}</span>
              <span className='min-w-0 flex-1 leading-6'>{DAY_NIGHT_STATUS_LABELS[status]}</span>
              {status === currentStatus && <span className='text-xs'>Current</span>}
            </li>
          ))}
        </ul>
      </section>
    </Card>
  );
};

export default DayNight;

/** 展示日夜场状态码及对应业务说明 */
const formatDayNightStatus = (currStatus?: DayNightStatusEnum) => {
  const status = currStatus?.trim();
  if (!status) return '--';

  return DAY_NIGHT_STATUS_MAP.get(status) ?? `${status} Unknown Status`;
};
