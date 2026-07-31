import { useEffect, useState } from 'react';
import { getTaskPageData } from '@/api/tasks';
import type { TaskPageData } from '@/api/tasks';

/**
 * 明细页通过聚合接口一次获取 Task、原始 Customer、完整 customerChange 与附件元数据。
 * 单一状态对象保证四部分数据来自同一次响应，不会出现多请求结果交叉。
 */
export default function useTaskDetail(taskId?: string) {
  const [taskPageData, setTaskPageData] = useState<TaskPageData | null>(null);
  const [loading, setLoading] = useState(Boolean(taskId));
  const [error, setError] = useState(!taskId);

  useEffect(() => {
    if (!taskId) {
      setTaskPageData(null);
      setLoading(false);
      setError(true);
      return;
    }

    let active = true;
    setTaskPageData(null);
    setLoading(true);
    setError(false);

    getTaskPageData(taskId)
      .then((data) => {
        if (active) {
          setTaskPageData(data ?? null);
          setError(!data);
        }
      })
      .catch(() => {
        // 请求层已统一显示具体错误；Hook 仅暴露失败状态供页面结束加载态。
        if (active) {
          setTaskPageData(null);
          setError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [taskId]);

  return {
    task: taskPageData?.task ?? null,
    customer: taskPageData?.customer ?? null,
    customerChange: taskPageData?.customerChange ?? null,
    attachments: taskPageData?.attachments ?? [],
    loading,
    error,
  };
}
