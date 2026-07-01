import { useEffect, useState } from 'react';
import type { Attachment, Customer } from '@/types';
import { getCustomer, getTask } from '@/api/tasks';

// 任务详情加载：任务携带 customerId 与附件，据 customerId 再查客户详情。
// maker / checker 页共用；alive 守卫避免 id 快速切换或卸载后写入过期结果。
export default function useTaskDetail(id?: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    getTask(id)
      .then((task) => {
        if (alive) setAttachments(task.attachments);
        return getCustomer(task.customerId);
      })
      .then((c) => {
        if (alive) setCustomer(c);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  return { customer, attachments, loading };
}
