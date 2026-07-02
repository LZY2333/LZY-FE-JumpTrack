import { useEffect, useState } from 'react';
import type { Attachment, Customer, Task } from '@/types';
import { getCustomer, getTask } from '@/api/tasks';

// 任务详情加载：任务携带 customerId 与附件，据 customerId 再查客户详情，
// task.status 供详情页判断可编辑阶段与按钮展示；alive 守卫避免 id 快速切换或卸载后写入过期结果。
export default function useTaskDetail(id?: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    getTask(id)
      .then((taskData) => {
        if (alive) {
          setTask(taskData);
          setAttachments(taskData.attachments);
        }
        return getCustomer(taskData.customerId);
      })
      .then((customerData) => {
        if (alive) setCustomer(customerData);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  return { task, customer, attachments, loading };
}
