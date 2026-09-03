import type { MessageQueryConditions, MessageQuerySortOrder } from '@/api/messages';
import type { MessageSortField, MessageSortOrder } from '@/types/enums';

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

/** 按页面顺序生成查询条件并排除空值，字段联动由各 FormItem 自行处理。 */
export const buildQueryConditions = (
  filters: MessageListFilterValues,
  sortField?: MessageSortField,
  sortOrder?: MessageSortOrder,
): MessageQueryConditions => {
  const querySortOrder: MessageQuerySortOrder = sortOrder === 'ascend' ? 'asc' : 'desc';
  return {
    msgDirection: filters.msgDirection,
    ...omitEmptyValues({
      businessType: filters.businessType,
      msgRecvStatus: filters.msgRecvStatus,
      msgSendStatus: filters.msgSendStatus,
      msgDateFrom: filters.msgDateRange?.[0],
      msgDateTo: filters.msgDateRange?.[1],
      msgType: filters.msgType,
      msgBusinessNo: filters.msgBusinessNo,
      msgId: filters.msgId,
      tranId: filters.tranId,
      currency: filters.currency,
      amountFrom: filters.amountFrom,
      amountTo: filters.amountTo,
      msgChannel: filters.msgChannel,
      msgOwnerDept: filters.msgOwnerDept,
      msgOwnerGroup: filters.msgOwnerGroup,
      mainMsgId: filters.mainMsgId,
      msgRelatedId: filters.msgRelatedId,
      msgEndId: filters.msgEndId,
      msgUetr: filters.msgUetr,
      sortField,
      sortOrder: sortOrder ? querySortOrder : undefined,
    }),
  };
};

/** 收敛表格允许发起的远程排序字段。 */
export const isMessageSortField = (value: unknown): value is MessageSortField =>
  value === 'msgDate' || value === 'createTime' || value === 'updateTime';

/** 清除空查询条件，保留金额为零等有效值。 */
const omitEmptyValues = <Values extends object>(values: Values) =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as { [Field in keyof Values]?: NonNullable<Values[Field]> };
