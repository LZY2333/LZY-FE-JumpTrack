import { useCallback, useEffect, useState } from 'react';
import type { Moment } from 'moment';
import type { Task } from '@/types';
import { getTasks } from '@/api/tasks';
import type { TaskSortField, TaskSortOrder } from '@/api/tasks';

// 任务池的查询状态与数据：分页 + 筛选 + 排序，任一查询条件变化都回到第一页。
// 文本输入的防抖由 task-pool 页面负责，这里只接收最终查询值。
export default function useTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState('');
  const [taskId, setTaskId] = useState('');
  const [cusId, setCusId] = useState('');
  const [dateRange, setDateRange] = useState<[Moment, Moment] | null>(null);
  const [updateDateRange, setUpdateDateRange] = useState<[Moment, Moment] | null>(null);
  const [sortField, setSortField] = useState<TaskSortField>();
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>();

  useEffect(() => {
    setLoading(true);
    getTasks({
      current,
      pageSize,
      status: status || undefined,
      taskId: taskId.trim() || undefined,
      cusId: cusId.trim() || undefined,
      dateFrom: dateRange?.[0].format('YYYY-MM-DD'),
      dateTo: dateRange?.[1].format('YYYY-MM-DD'),
      updateDateFrom: updateDateRange?.[0].format('YYYY-MM-DD'),
      updateDateTo: updateDateRange?.[1].format('YYYY-MM-DD'),
      sortField,
      sortOrder,
    })
      .then((res) => {
        setTasks(res.list);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [current, pageSize, status, taskId, cusId, dateRange, updateDateRange, sortField, sortOrder]);

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
  const changeDateRange = useCallback((value: [Moment, Moment] | null) => {
    setDateRange(value);
    setCurrent(1);
  }, []);
  const changeUpdateDateRange = useCallback((value: [Moment, Moment] | null) => {
    setUpdateDateRange(value);
    setCurrent(1);
  }, []);
  const changeSort = useCallback((field?: TaskSortField, order?: TaskSortOrder) => {
    setSortField(field);
    setSortOrder(order);
    setCurrent(1);
  }, []);
  const reset = useCallback(() => {
    setStatus('');
    setTaskId('');
    setCusId('');
    setDateRange(null);
    setUpdateDateRange(null);
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
    dateRange,
    updateDateRange,
    setCurrent,
    setPageSize,
    changeStatus,
    changeTaskId,
    changeCusId,
    changeDateRange,
    changeUpdateDateRange,
    changeSort,
    reset,
  };
}
