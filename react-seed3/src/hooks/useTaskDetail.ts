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

// Submit 时调用：只把表单值相对接口原始 Customer 变动的字段（即高亮字段）挑出来，
// 序列化为 newValue 传给后端，而非整份 customer——未改动字段不随请求重复提交。
export function buildNewValue(customer: Customer, original: Customer): string {
  const diff: Record<string, unknown> = {};
  (Object.keys(customer) as (keyof Customer)[]).forEach((key) => {
    if (JSON.stringify(customer[key]) !== JSON.stringify(original[key])) {
      diff[key] = customer[key];
    }
  });
  return JSON.stringify(diff);
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
