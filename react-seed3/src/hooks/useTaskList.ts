import { useCallback, useEffect, useState } from 'react';
import type { Moment } from 'moment';
import type { Task } from '@/types';
import { getTasks } from '@/api/tasks';

// 任务池的查询状态与数据：分页 + 状态/客户名/日期筛选，任一筛选变化都回到第一页。
// 客户名的输入防抖由 TaskFilters 负责，这里只接收最终查询值。
export default function useTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [dateRange, setDateRange] = useState<[Moment, Moment] | null>(null);

  useEffect(() => {
    setLoading(true);
    getTasks({
      page,
      pageSize,
      status: status || undefined,
      customerName: customerName.trim() || undefined,
      dateFrom: dateRange?.[0].format('YYYY-MM-DD'),
      dateTo: dateRange?.[1].format('YYYY-MM-DD'),
    })
      .then((res) => {
        setTasks(res.data);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, status, customerName, dateRange]);

  const changeStatus = useCallback((v: string) => {
    setStatus(v);
    setPage(1);
  }, []);
  const changeCustomerName = useCallback((v: string) => {
    setCustomerName(v);
    setPage(1);
  }, []);
  const changeDateRange = useCallback((v: [Moment, Moment] | null) => {
    setDateRange(v);
    setPage(1);
  }, []);
  const reset = useCallback(() => {
    setStatus('');
    setCustomerName('');
    setDateRange(null);
    setPage(1);
  }, []);

  return {
    tasks,
    total,
    loading,
    page,
    pageSize,
    status,
    dateRange,
    setPage,
    setPageSize,
    changeStatus,
    changeCustomerName,
    changeDateRange,
    reset,
  };
}
