import { useCallback, useEffect, useState } from 'react';
import type { MessageRecord } from '@/types';
import { getMessages } from '@/api/messages';
import type { MessageQuery, MessageQueryConditions, MessageQuerySortOrder } from '@/api/messages';
import type { MessageDirection, MessageSortField, MessageSortOrder, MsgRecvStatus } from '@/types/enums';

export interface MessageListFilterValues {
  /** MSG_ID：报文标识号。 */
  msgId?: string;
  /** MSG_BUSINESS_NO：业务流水号。 */
  msgBusinessNo?: string;
  /** MSG_TYPE：报文类型编码。 */
  msgType?: string;
  /** MSG_BUS_TYPE：报文业务类型编码。 */
  msgBusType?: string;
  /** MSG_DIRECTION：报文收发标志。 */
  msgDirection?: MessageDirection;
  /** MSG_RECV_STATUS：收报状态。 */
  msgRecvStatus?: MsgRecvStatus;
  /** MSG_SEND_STATUS：发报状态。 */
  msgSendStatus?: string;
  /** MSG_RECV_DATE：收报日期范围。 */
  msgRecvDateRange?: [string, string] | null;
  /** MSG_SEND_DATE：发报日期范围。 */
  msgSendDateRange?: [string, string] | null;
  /** MSG_CHANNEL：收发报通道。 */
  msgChannel?: string;
  /** MAIN_MSG_ID：主报文编号。 */
  mainMsgId?: string;
  /** MSG_RELATED_ID：关联流水号。 */
  msgRelatedId?: string;
  /** MSG_END_ID：端到端流水号。 */
  msgEndId?: string;
  /** MSG_UETR：UETR唯一标识号。 */
  msgUetr?: string;
  /** MSG_SEND_INST：发报机构编号。 */
  msgSendInst?: string;
  /** MSG_RECV_INST：收报机构编号。 */
  msgRecvInst?: string;
  /** REF_NO：收发任务交易编号。 */
  refNo?: string;
  /** TRAN_ID：支付类报文交易标识号。 */
  tranId?: string;
  /** 统一金额范围起点。 */
  amountFrom?: number | null;
  /** 统一金额范围终点。 */
  amountTo?: number | null;
  /** MSG_OWNER_DEPT：收报归属部门。 */
  msgOwnerDept?: string;
  /** MSG_OWNER_GROUP：收报归属组。 */
  msgOwnerGroup?: string;
  /** STP_IND：直通标记。 */
  stpInd?: string;
  /** NON_STP_CODE：非直通原因编号。 */
  nonStpCode?: string;
}

const PAGE_SIZE_STORAGE_KEY = 'message-list-page-size';
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

/** 报文列表查询状态：保留现有分页、筛选和远程排序交互。 */
const useMessageList = (initialFilters: MessageListFilterValues) => {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSizeState] = useState(() => {
    const storedPageSize = Number(localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
    return PAGE_SIZE_OPTIONS.includes(storedPageSize) ? storedPageSize : DEFAULT_PAGE_SIZE;
  });
  const [filters, setFilters] = useState<MessageListFilterValues>(() => ({ ...initialFilters }));
  const [sortField, setSortField] = useState<MessageSortField>();
  const [sortOrder, setSortOrder] = useState<MessageSortOrder>();

  const queryConditions = buildQueryConditions(filters, sortField, sortOrder);

  useEffect(() => {
    // 路由离开或条件快速变化时忽略旧请求结果，避免覆盖较新的列表状态。
    let active = true;
    setLoading(true);

    const requestParams: MessageQuery = { current, pageSize, ...queryConditions };
    getMessages(requestParams)
      .then((result) => {
        if (!active) return;
        setMessages(result?.list ?? []);
        setTotal(result?.total ?? 0);
      })
      .catch(() => {
        if (!active) return;
        setMessages([]);
        setTotal(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [current, pageSize, filters, sortField, sortOrder]);

  const query = useCallback((values: MessageListFilterValues) => {
    setFilters({ ...values });
    setCurrent(1);
  }, []);

  const setSort = useCallback((field?: MessageSortField, order?: MessageSortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setCurrent(1);
  }, []);

  const setPageSize = useCallback((value: number) => {
    localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(value));
    setPageSizeState(value);
  }, []);

  const reset = useCallback(() => {
    setFilters({ ...initialFilters });
    setSortField(undefined);
    setSortOrder(undefined);
    setCurrent(1);
  }, [initialFilters]);

  return {
    messages,
    total,
    loading,
    current,
    pageSize,
    setCurrent,
    setPageSize,
    query,
    setSort,
    reset,
  };
};

/** 清除空条件 */
const buildQueryConditions = (
  filters?: MessageListFilterValues,
  sortField?: MessageSortField,
  sortOrder?: MessageSortOrder,
): MessageQueryConditions => {
  const querySortOrder: MessageQuerySortOrder = sortOrder === 'ascend' ? 'asc' : 'desc';
  return omitEmptyValues({
    msgId: filters?.msgId,
    msgBusinessNo: filters?.msgBusinessNo,
    msgType: filters?.msgType,
    msgBusType: filters?.msgBusType,
    msgDirection: filters?.msgDirection,
    msgRecvStatus: filters?.msgRecvStatus,
    msgSendStatus: filters?.msgSendStatus,
    msgRecvDateFrom: filters?.msgRecvDateRange?.[0],
    msgRecvDateTo: filters?.msgRecvDateRange?.[1],
    msgSendDateFrom: filters?.msgSendDateRange?.[0],
    msgSendDateTo: filters?.msgSendDateRange?.[1],
    msgChannel: filters?.msgChannel,
    mainMsgId: filters?.mainMsgId,
    msgRelatedId: filters?.msgRelatedId,
    msgEndId: filters?.msgEndId,
    msgUetr: filters?.msgUetr,
    msgSendInst: filters?.msgSendInst,
    msgRecvInst: filters?.msgRecvInst,
    refNo: filters?.refNo,
    tranId: filters?.tranId,
    amountFrom: filters?.amountFrom ?? undefined,
    amountTo: filters?.amountTo ?? undefined,
    msgOwnerDept: filters?.msgOwnerDept,
    msgOwnerGroup: filters?.msgOwnerGroup,
    stpInd: filters?.stpInd,
    nonStpCode: filters?.nonStpCode,
    sortField,
    sortOrder: sortOrder ? querySortOrder : undefined,
  });
};

/** 删除查询条件对象中的空值字段。 */
const omitEmptyValues = <T extends Record<string, unknown>>(data: T) => {
  const entries = Object.entries(data).filter(([, value]) => !isEmptyValue(value));
  return Object.fromEntries(entries) as Partial<T>;
};

/** 判断查询条件值是否为空。 */
const isEmptyValue = (value: unknown) =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

export default useMessageList;
