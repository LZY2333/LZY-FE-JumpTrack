import { useCallback, useEffect, useState } from 'react';
import { getLcwTasks, retryLcwTasks } from '@/api/lcw';
import type { LcwQuery, LcwSortField } from '@/api/lcw';
import type { LcwRecord } from '@/types';
import type { SortOrder } from '@/types/enums';
import { buildLcwQueryConditions, type LcwListFilterValues } from './lcwListUtil';

const PAGE_SIZE_STORAGE_KEY = 'lcw-list-page-size';
export const LCW_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = LCW_PAGE_SIZE_OPTIONS[0];

/** 编排 LCW 异常列表查询、分页、排序和批量重试。 */
const useLcwList = (initialFilters: LcwListFilterValues) => {
  const [records, setRecords] = useState<LcwRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSizeState] = useState(() => {
    const storedPageSize = Number(localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
    return LCW_PAGE_SIZE_OPTIONS.includes(storedPageSize) ? storedPageSize : DEFAULT_PAGE_SIZE;
  });
  const [filters, setFilters] = useState<LcwListFilterValues>(() => cloneFilters(initialFilters));
  const [sortField, setSortField] = useState<LcwSortField>();
  const [sortOrder, setSortOrder] = useState<SortOrder>();
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const request: LcwQuery = {
      current,
      pageSize,
      ...buildLcwQueryConditions(filters, sortField, sortOrder),
    };
    getLcwTasks(request)
      .then((result) => {
        if (!active) return;
        setRecords(result?.list ?? []);
        setTotal(result?.total ?? 0);
      })
      .catch(() => {
        if (!active) return;
        setRecords([]);
        setTotal(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [current, filters, pageSize, refreshVersion, sortField, sortOrder]);

  const query = useCallback((values: LcwListFilterValues) => {
    setFilters(cloneFilters(values));
    setCurrent(1);
  }, []);

  const setSort = useCallback((field?: LcwSortField, order?: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setCurrent(1);
  }, []);

  const setPageSize = useCallback((value: number) => {
    localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(value));
    setPageSizeState(value);
  }, []);

  const reset = useCallback(() => {
    setFilters(cloneFilters(initialFilters));
    setSortField(undefined);
    setSortOrder(undefined);
    setCurrent(1);
  }, [initialFilters]);

  const retry = useCallback(async (msgIds: string[]) => {
    setRetrying(true);
    try {
      await retryLcwTasks({ msgIds });
      setCurrent(1);
      setRefreshVersion((version) => version + 1);
    } finally {
      setRetrying(false);
    }
  }, []);

  return {
    records,
    total,
    loading,
    retrying,
    current,
    pageSize,
    setCurrent,
    setPageSize,
    setSort,
    query,
    reset,
    retry,
  };
};

const cloneFilters = (filters: LcwListFilterValues): LcwListFilterValues => ({
  ...filters,
  lcwInitialStatuses: filters.lcwInitialStatuses ? [...filters.lcwInitialStatuses] : undefined,
});

export default useLcwList;
