import { useCallback, useEffect, useState } from 'react';
import type { MessageRecord } from '@/types';
import { getMessages } from '@/api/messages';
import type { MessageQuery } from '@/api/messages';
import type { MessageSortField, MessageSortOrder } from '@/types/enums';
import { buildQueryConditions, type MessageListFilterValues } from './messageListUtil';

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

  useEffect(() => {
    // 路由离开或条件快速变化时忽略旧请求结果，避免覆盖较新的列表状态。
    let active = true;
    setLoading(true);

    const requestParams: MessageQuery = { current, pageSize, ...buildQueryConditions(filters, sortField, sortOrder) };
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
    queryDirection: filters.msgDirection,
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

export default useMessageList;
