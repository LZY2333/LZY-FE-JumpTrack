import { useCallback, useEffect, useState } from 'react';
import type { Task } from '@/types';
import { getTasks } from '@/api/tasks';
import type { TaskQuery, TaskQuerySortOrder } from '@/api/tasks';
import type { TaskSortField, TaskSortOrder } from '@/types/enums';
import useTaskPoolStore from '@/store/useTaskPoolStore';
import { omitEmptyValues } from '@/utils/formUtil';

export interface TaskPoolFilterValues {
  status: string;
  taskId: string;
  taskName: string;
  createTimeRange: [string, string] | null;
  updateTimeRange: [string, string] | null;
}

const PAGE_SIZE_STORAGE_KEY = 'task-pool-page-size';
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

/** 任务池的查询状态与数据：分页、筛选、排序与跨页刷新。 */
const useTaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  // 首次渲染时读取并校验上次使用的分页大小。
  const [pageSize, setPageSizeState] = useState(() => {
    const storedPageSize = Number(localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
    return PAGE_SIZE_OPTIONS.includes(storedPageSize) ? storedPageSize : DEFAULT_PAGE_SIZE;
  });
  const [filters, setFilters] = useState<TaskPoolFilterValues>();
  const [sortField, setSortField] = useState<TaskSortField>();
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>();
  const refreshVersion = useTaskPoolStore((state) => state.refreshVersion);

  // 查询状态变化时重新加载当前页任务。
  useEffect(() => {
    setLoading(true);
    const querySortOrder: TaskQuerySortOrder = sortOrder === 'ascend' ? 'asc' : 'desc';
    const requestParams: TaskQuery = {
      current,
      pageSize,
      ...omitEmptyValues({
        status: filters?.status,
        taskId: filters?.taskId,
        taskName: filters?.taskName,
        createTimeFrom: filters?.createTimeRange?.[0],
        createTimeTo: filters?.createTimeRange?.[1],
        updateTimeFrom: filters?.updateTimeRange?.[0],
        updateTimeTo: filters?.updateTimeRange?.[1],
        sortField,
        sortOrder: sortOrder ? querySortOrder : undefined,
      }),
    };

    getTasks(requestParams)
      .then((result) => {
        setTasks(result?.list ?? []);
        setTotal(result?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [current, pageSize, filters, sortField, sortOrder, refreshVersion]);

  /** 提交筛选条件并返回第一页。 */
  const query = useCallback((values: TaskPoolFilterValues) => {
    setFilters({ ...values });
    setCurrent(1);
  }, []);

  /** 更新排序条件并返回第一页。 */
  const setSort = useCallback((field?: TaskSortField, order?: TaskSortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setCurrent(1);
  }, []);

  /** 更新并持久化每页任务数量。 */
  const setPageSize = useCallback((value: number) => {
    localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(value));
    setPageSizeState(value);
  }, []);

  /** 清空筛选和排序条件并返回第一页。 */
  const reset = useCallback(() => {
    setFilters(undefined);
    setSortField(undefined);
    setSortOrder(undefined);
    setCurrent(1);
  }, []);

  return {
    tasks,
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

export default useTaskList;
