import { useEffect, useState } from 'react';
import { getTask } from '@/api/tasks';
import type { Task } from '@/types';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';

/** 获取任务详情，并统一接入全局加载状态。 */
const useTaskDetail = (taskId?: string) => {
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!taskId) {
      setTask(null);
      return;
    }

    let active = true;
    const stopGlobalLoading = startGlobalLoading();
    setTask(null);

    getTask(taskId)
      .then((data) => {
        if (active) setTask(data ?? null);
      })
      .catch(() => {
        if (active) setTask(null);
      })
      .finally(stopGlobalLoading);

    return () => {
      active = false;
      stopGlobalLoading();
    };
  }, [taskId]);

  return task;
};

export default useTaskDetail;
