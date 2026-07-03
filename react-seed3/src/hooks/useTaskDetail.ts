import { useEffect, useState } from 'react';
import type { Attachment, Customer, Task, TaskNewValue } from '@/types';
import { getCustomer, getTask } from '@/api/tasks';

function parseNewValue(newValue: string): TaskNewValue {
  if (!newValue) return {};
  try {
    return JSON.parse(newValue) as TaskNewValue;
  } catch {
    return {};
  }
}

// 任务详情加载：任务携带 cusId 与附件，据 cusId 再查客户详情；
// task.newValue 是 maker 之前保存的草稿差异（相对 customer 接口变动的字段，不含附件），
// 解析后与查回的 customer 合并，作为表单的初始值；originalCustomer 保留接口原始值不变，
// 供 TaskForm 做高亮对比。alive 守卫避免 id 快速切换或卸载后写入过期结果。
export default function useTaskDetail(id?: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [originalCustomer, setOriginalCustomer] = useState<Customer | null>(null);
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
        return getCustomer(taskData.cusId).then((customerData) => ({ taskData, customerData }));
      })
      .then(({ taskData, customerData }) => {
        if (!alive) return;
        const customerDiff = parseNewValue(taskData.newValue);
        setOriginalCustomer(customerData);
        setCustomer({ ...customerData, ...customerDiff });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  return { task, customer, originalCustomer, attachments, loading };
}
