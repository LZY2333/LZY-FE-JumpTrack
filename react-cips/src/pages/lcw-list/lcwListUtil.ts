import type { LcwQueryConditions, LcwSortField } from '@/api/lcw';
import { QuerySortOrder, SortOrder } from '@/types/enums';
import { omitEmptyValues } from '@/utils';

/** LCW 异常筛选表单值。 */
export type LcwListFilterValues = Omit<LcwQueryConditions, 'msgDateFrom' | 'msgDateTo' | 'sortField' | 'sortOrder'> & {
  /** 收发报日期区间，控件内保存覆盖整日的 ISO 时间。 */
  msgDateRange?: [string, string] | null;
};

/** 构造查询条件Object。 */
export const buildLcwQueryConditions = (
  filters: LcwListFilterValues,
  sortField?: LcwSortField,
  sortOrder?: SortOrder,
): LcwQueryConditions => {
  const { msgDateRange, ...filter } = filters;
  return omitEmptyValues({
    ...filter,
    msgDateFrom: msgDateRange?.[0],
    msgDateTo: msgDateRange?.[1],
    sortField,
    sortOrder: toQuerySortOrder(sortOrder),
  });
};

/** 收敛 LCW 异常列表允许发起的服务端排序字段。 */
export const isLcwSortField = (value: unknown): value is LcwSortField =>
  value === 'msgDate' || value === 'lcwInitialTime';

const toQuerySortOrder = (sortOrder?: SortOrder) => {
  if (sortOrder === SortOrder.Ascend) return QuerySortOrder.Asc;
  if (sortOrder === SortOrder.Descend) return QuerySortOrder.Desc;
  return undefined;
};
