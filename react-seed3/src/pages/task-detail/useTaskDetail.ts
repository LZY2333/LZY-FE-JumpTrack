import { useEffect, useState } from 'react';
import { getTaskPageData } from '@/api/tasks';
import type { TaskPageData } from '@/api/tasks';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';

/** 明细页通过聚合接口一次获取任务和附件元数据。 */
export default function useTaskDetail(taskId?: string) {
  const [taskPageData, setTaskPageData] = useState<TaskPageData | null>(null);

  useEffect(() => {
    if (!taskId) {
      setTaskPageData(null);
      return;
    }

    let active = true;
    const stopGlobalLoading = startGlobalLoading();

    setTaskPageData(null);

    getTaskPageData(taskId)
      .then((data) => {
        if (active) {
          setTaskPageData(data ?? null);
        }
      })
      .catch(() => {
        // 请求层负责全局错误提示，详情页保持无数据的只读表单。
        if (active) setTaskPageData(null);
      })
      .finally(() => {
        stopGlobalLoading();
      });

    return () => {
      active = false;
      stopGlobalLoading();
    };
  }, [taskId]);

  return {
    task: taskPageData?.task ?? null,
    attachments: taskPageData?.attachments ?? [],
  };
}
