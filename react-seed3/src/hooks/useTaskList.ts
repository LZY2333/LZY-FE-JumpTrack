import { useCallback, useEffect, useState } from 'react';
import type { Moment } from 'moment';
import type { Task } from '@/types';
import { getTasks } from '@/api/tasks';

// 任务池的查询状态与数据：分页 + 状态/客户号/日期筛选，任一筛选变化都回到第一页。
// 客户号的输入防抖由 task-pool 页面负责，这里只接收最终查询值。
export default function useTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState('');
  const [cusId, setCusId] = useState('');
  const [dateRange, setDateRange] = useState<[Moment, Moment] | null>(null);

  useEffect(() => {
    setLoading(true);
    getTasks({
      current,
      pageSize,
      status: status || undefined,
      cusId: cusId.trim() || undefined,
      dateFrom: dateRange?.[0].format('YYYY-MM-DD'),
      dateTo: dateRange?.[1].format('YYYY-MM-DD'),
    })
      .then((res) => {
        setTasks(res.list);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [current, pageSize, status, cusId, dateRange]);

  const changeStatus = useCallback((value: string) => {
    setStatus(value);
    setCurrent(1);
  }, []);
  const changeCusId = useCallback((value: string) => {
    setCusId(value);
    setCurrent(1);
  }, []);
  const changeDateRange = useCallback((value: [Moment, Moment] | null) => {
    setDateRange(value);
    setCurrent(1);
  }, []);
  const reset = useCallback(() => {
    setStatus('');
    setCusId('');
    setDateRange(null);
    setCurrent(1);
  }, []);

  return {
    tasks,
    total,
    loading,
    current,
    pageSize,
    status,
    dateRange,
    setCurrent,
    setPageSize,
    changeStatus,
    changeCusId,
    changeDateRange,
    reset,
  };
}
