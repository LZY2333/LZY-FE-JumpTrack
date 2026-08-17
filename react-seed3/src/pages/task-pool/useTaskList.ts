import { useCallback, useEffect, useState } from 'react';
import type { Moment } from 'moment';
import type { Task } from '@/types';
import { getTasks } from '@/api/tasks';
import type { TaskSortField, TaskSortOrder } from '@/api/tasks';
import useTaskPoolStore from '@/store/useTaskPoolStore';

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

// 任务池的查询状态与数据：分页 + 筛选 + 排序，任一查询条件变化都回到第一页。
// 文本输入的防抖由 task-pool 页面负责，这里只接收最终查询值。
export default function useTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSizeState] = useState(readPageSize);
  const [status, setStatus] = useState('');
  const [taskId, setTaskId] = useState('');
  const [cusId, setCusId] = useState('');
  const [createTimeRange, setCreateTimeRange] = useState<[Moment, Moment] | null>(null);
  const [transactionTimeRange, setTransactionTimeRange] = useState<[Moment, Moment] | null>(null);
  const [updateTimeRange, setUpdateTimeRange] = useState<[Moment, Moment] | null>(null);
  const [sortField, setSortField] = useState<TaskSortField>();
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>();
  const refreshVersion = useTaskPoolStore((state) => state.refreshVersion);

  useEffect(() => {
    setLoading(true);
    getTasks({
      current,
      pageSize,
      status: status || undefined,
      taskId: taskId.trim() || undefined,
      cusId: cusId.trim() || undefined,
      createTimeFrom: createTimeRange?.[0].format('YYYY-MM-DD'),
      createTimeTo: createTimeRange?.[1].format('YYYY-MM-DD'),
      transactionTimeFrom: transactionTimeRange?.[0].format('YYYY-MM-DD'),
      transactionTimeTo: transactionTimeRange?.[1].format('YYYY-MM-DD'),
      updateTimeFrom: updateTimeRange?.[0].format('YYYY-MM-DD'),
      updateTimeTo: updateTimeRange?.[1].format('YYYY-MM-DD'),
      sortField,
      sortOrder,
    })
      .then((res) => {
        setTasks(res?.list ?? []);
        setTotal(res?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [
    current,
    pageSize,
    status,
    taskId,
    cusId,
    createTimeRange,
    transactionTimeRange,
    updateTimeRange,
    sortField,
    sortOrder,
    refreshVersion,
  ]);

  const changeStatus = useCallback((value: string) => {
    setStatus(value);
    setCurrent(1);
  }, []);
  const changeCusId = useCallback((value: string) => {
    setCusId(value);
    setCurrent(1);
  }, []);
  const changeTaskId = useCallback((value: string) => {
    setTaskId(value);
    setCurrent(1);
  }, []);
  const changeCreateTimeRange = useCallback((value: [Moment, Moment] | null) => {
    setCreateTimeRange(value);
    setCurrent(1);
  }, []);
  const changeTransactionTimeRange = useCallback((value: [Moment, Moment] | null) => {
    setTransactionTimeRange(value);
    setCurrent(1);
  }, []);
  const changeUpdateTimeRange = useCallback((value: [Moment, Moment] | null) => {
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
    setCusId('');
    setCreateTimeRange(null);
    setTransactionTimeRange(null);
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
    status,
    taskId,
    createTimeRange,
    transactionTimeRange,
    updateTimeRange,
    setCurrent,
    setPageSize,
    changeStatus,
    changeTaskId,
    changeCusId,
    changeCreateTimeRange,
    changeTransactionTimeRange,
    changeUpdateTimeRange,
    changeSort,
    reset,
  };
}
