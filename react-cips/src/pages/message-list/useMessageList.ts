import { useCallback, useEffect, useState } from 'react';
import type { MessageRecord } from '@/types';
import { getMessages } from '@/api/messages';
import type { MessageQuery, MessageQueryConditions, MessageQuerySortOrder } from '@/api/messages';
import type {
  BusinessType,
  MessageDirection,
  MessageSortField,
  MessageSortOrder,
  TransmissionStatus,
} from '@/types/enums';

export interface MessageListFilterValues {
  msgId?: string;
  msgBusinessNo?: string;
  msgType?: string;
  msgDirection?: MessageDirection;
  transmissionStatus?: TransmissionStatus;
  messageTimeRange?: [string, string] | null;
  businessType?: BusinessType;
  msgChannel?: string;
  mainMsgId?: string;
  msgRelatedId?: string;
  msgEndId?: string;
  msgUetr?: string;
  msgSendInst?: string;
  msgRecvInst?: string;
  amountFrom?: number | null;
  amountTo?: number | null;
  clearingTargetDepartment?: string;
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
    msgDirection: filters?.msgDirection,
    transmissionStatus: filters?.transmissionStatus,
    messageTimeFrom: filters?.messageTimeRange?.[0],
    messageTimeTo: filters?.messageTimeRange?.[1],
    businessType: filters?.businessType,
    msgChannel: filters?.msgChannel,
    mainMsgId: filters?.mainMsgId,
    msgRelatedId: filters?.msgRelatedId,
    msgEndId: filters?.msgEndId,
    msgUetr: filters?.msgUetr,
    msgSendInst: filters?.msgSendInst,
    msgRecvInst: filters?.msgRecvInst,
    amountFrom: filters?.amountFrom ?? undefined,
    amountTo: filters?.amountTo ?? undefined,
    clearingTargetDepartment: filters?.clearingTargetDepartment,
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
