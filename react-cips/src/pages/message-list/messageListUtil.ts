import type { MessageQueryConditions, MessageSortField } from '@/api/messages';
import { MessageDirection, QuerySortOrder, SortOrder } from '@/types/enums';
import { omitEmptyValues } from '@/utils';

/** 报文筛选表单值；字段顺序沿用 API，仅替换日期区间和金额空值类型。 */
export type MessageListFilterValues = Omit<
  MessageQueryConditions,
  'msgDateFrom' | 'msgDateTo' | 'amountFrom' | 'amountTo' | 'sortField' | 'sortOrder'
> & {
  /** 收发日期区间：MSG_RECV_DATE / MSG_SEND_DATE。 */
  msgDateRange?: [string, string] | null;
  /** 金额下限：REMIT_AMOUNT / GPI_AMOUNT / NETTING_AMOUNT。 */
  amountFrom?: number | null;
  /** 金额上限：REMIT_AMOUNT / GPI_AMOUNT / NETTING_AMOUNT。 */
  amountTo?: number | null;
};

/** 构造查询条件Object。 */
export const buildQueryConditions = (
  filters: MessageListFilterValues,
  sortField?: MessageSortField,
  sortOrder?: SortOrder,
): MessageQueryConditions => {
  const { msgDateRange, ...filter } = filters;
  const directionFilter =
    filter.msgDirection === MessageDirection.In
      ? { ...filter, msgSendStatus: undefined, fromSystem: undefined }
      : { ...filter, msgRecvStatus: undefined, msgOwnerDept: undefined, msgOwnerGroup: undefined };
  const querySortOrder = sortOrder === SortOrder.Ascend ? QuerySortOrder.Asc : QuerySortOrder.Desc;
  return omitEmptyValues({
    ...directionFilter,
    msgDateFrom: msgDateRange?.[0],
    msgDateTo: msgDateRange?.[1],
    sortField,
    sortOrder: sortOrder ? querySortOrder : undefined,
  });
};

/** 收敛表格允许发起的远程排序字段。 */
export const isMessageSortField = (value: unknown): value is MessageSortField =>
  value === 'msgDate' || value === 'createTime' || value === 'updateTime';
