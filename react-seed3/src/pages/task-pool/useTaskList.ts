import { useCallback, useEffect, useState } from 'react';
import type { Dayjs } from 'dayjs';
import type { Task } from '@/types';
import { getTasks } from '@/api/tasks';
import type { TaskSortField, TaskSortOrder } from '@/api/tasks';
import useTaskPoolStore from '@/store/useTaskPoolStore';
import { omitEmptyValues } from '@/utils/formUtil';

const PAGE_SIZE_STORAGE_KEY = 'task-pool-page-size';
const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const readPageSize = () => {
  try {
    const storedPageSize = Number(localStorage.getItem(PAGE_SIZE_STORAGE_KEY));
    return PAGE_SIZE_OPTIONS.includes(storedPageSize) ? storedPageSize : DEFAULT_PAGE_SIZE;
  } catch {
    return DEFAULT_PAGE_SIZE;
  }
};

/** 任务池的查询状态与数据：分页、筛选、排序与跨页刷新。 */
const useTaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSizeState] = useState(readPageSize);
  const [status, setStatus] = useState('');
  const [taskId, setTaskId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [createTimeRange, setCreateTimeRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [updateTimeRange, setUpdateTimeRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [sortField, setSortField] = useState<TaskSortField>();
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>();
  const refreshVersion = useTaskPoolStore((state) => state.refreshVersion);

  useEffect(() => {
    setLoading(true);
    const query = {
      current,
      pageSize,
      ...omitEmptyValues({
        status,
        taskId: taskId.trim(),
        taskName: taskName.trim(),
        createTimeFrom: createTimeRange?.[0].format('YYYY-MM-DD'),
        createTimeTo: createTimeRange?.[1].format('YYYY-MM-DD'),
        updateTimeFrom: updateTimeRange?.[0].format('YYYY-MM-DD'),
        updateTimeTo: updateTimeRange?.[1].format('YYYY-MM-DD'),
        sortField,
        sortOrder,
      }),
    };

    getTasks(query)
      .then((result) => {
        setTasks(result?.list ?? []);
        setTotal(result?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [
    current,
    pageSize,
    status,
    taskId,
    taskName,
    createTimeRange,
    updateTimeRange,
    sortField,
    sortOrder,
    refreshVersion,
  ]);

  const changeStatus = useCallback((value: string) => {
    setStatus(value);
    setCurrent(1);
  }, []);
  const changeTaskId = useCallback((value: string) => {
    setTaskId(value);
    setCurrent(1);
  }, []);
  const changeTaskName = useCallback((value: string) => {
    setTaskName(value);
    setCurrent(1);
  }, []);
  const changeCreateTimeRange = useCallback((value: [Dayjs, Dayjs] | null) => {
    setCreateTimeRange(value);
    setCurrent(1);
  }, []);
  const changeUpdateTimeRange = useCallback((value: [Dayjs, Dayjs] | null) => {
    setUpdateTimeRange(value);
    setCurrent(1);
  }, []);
  const changeSort = useCallback((field?: TaskSortField, order?: TaskSortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setCurrent(1);
  }, []);
  const setPageSize = useCallback((value: number) => {
    const nextPageSize = PAGE_SIZE_OPTIONS.includes(value) ? value : DEFAULT_PAGE_SIZE;
    setPageSizeState(nextPageSize);
    localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(nextPageSize));
  }, []);
  const reset = useCallback(() => {
    setStatus('');
    setTaskId('');
    setTaskName('');
    setCreateTimeRange(null);
    setUpdateTimeRange(null);
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
    changeStatus,
    changeTaskId,
    changeTaskName,
    changeCreateTimeRange,
    changeUpdateTimeRange,
    changeSort,
    reset,
  };
};

export default useTaskList;
