import dayjs from 'dayjs';
import type { LcwQueryConditions } from '@/api/lcw';
import { MessageChannel, MessageDirection } from '@/types/enums';
import { omitEmptyValues } from '@/utils';

/** LCW 异常筛选表单值。 */
export type LcwListFilterValues = Omit<LcwQueryConditions, 'msgDateFrom' | 'msgDateTo'> & {
  /** 收发报纯日期区间 */
  msgDateRange?: [string, string] | null;
};

/** 构造 LCW 页面默认筛选条件 */
export const buildDefaultLcwFilters = (): LcwListFilterValues => {
  const today = dayjs().format('YYYY-MM-DD');
  return {
    msgDirection: MessageDirection.In,
    msgDateRange: [today, today],
    channel: [MessageChannel.Cips],
  };
};

/** 构造查询条件Object。 */
export const buildLcwQueryConditions = (filters: LcwListFilterValues): LcwQueryConditions => {
  const { msgDateRange, ...filter } = filters;
  return omitEmptyValues({
    ...filter,
    msgDateFrom: msgDateRange?.[0],
    msgDateTo: msgDateRange?.[1],
  });
};
