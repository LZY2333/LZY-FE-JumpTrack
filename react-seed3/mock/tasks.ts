import { TaskStatus } from '@/types/enums';
import type { Attachment, Customer, Task } from '@/types';
import { mockCustomers } from './customer';

const attachmentsFor = (id: string): Attachment[] => [
  { name: `Cover_Letter_${id}.pdf`, uid: `${id}-1` },
  { name: `Statement_${id}.pdf`, uid: `${id}-2` },
  { name: `Transaction_${id}.pdf`, uid: `${id}-3` },
];

const NAMES = [
  'Chen Wen 陈文', 'Li Ming 李明', 'Wang Fang 王芳', 'Zhang Wei 张伟', 'Liu Yang 刘洋',
  'Zhao Lei 赵磊', 'Sun Li 孙丽', 'Zhou Jie 周杰', 'Wu Hao 吴昊', 'Zheng Shuang 郑爽',
  'Feng Qin 冯琴', 'Han Xue 韩雪', 'Yang Guo 杨过', 'Xu Jing 徐静', 'He Ping 何平',
];

const STATUSES = [
  TaskStatus.Pending, TaskStatus.Submitted, TaskStatus.Returned, TaskStatus.Approved, TaskStatus.Cancelled,
];

// 模块级可变数组：Node.js 模块单例，dev server 进程存活期间状态持久，mock 接口直接修改此数组。
// 生成 38 条用于演示分页：发起日期递减、到期天数循环，覆盖全部状态；已批准/已取消视为无到期天数。
export const mockTasks: Task[] = Array.from({ length: 38 }, (_, i) => {
  const id = `T${String(i + 1).padStart(4, '0')}`;
  const status = STATUSES[i % STATUSES.length];
  const closed = status === TaskStatus.Approved || status === TaskStatus.Cancelled;
  return {
    id,
    refNo: id,
    customerName: NAMES[i % NAMES.length],
    createdAt: `2026-06-${String(28 - (i % 28)).padStart(2, '0')}`,
    status,
    daysUntilDue: closed ? null : i % 7,
    customerId: 'C0001',
    attachments: attachmentsFor(id),
  };
});

// vite-plugin-mock v2 不在 response 回调中暴露路径参数，只能从 URL 字符串手动解析；
// /api/task/:id 与 /api/task/{submit,return,approve}/:id 的 id 均为最后一段
function lastSeg(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

interface TasksQuery {
  page?: string;
  pageSize?: string;
  status?: string;
  customerName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default [
  {
    url: '/api/tasks',
    method: 'get',
    response: (opt: { query: TasksQuery }) => {
      const { page = '1', pageSize = '10', status, customerName, dateFrom, dateTo } = opt.query || {};
      let list = mockTasks;
      if (status) list = list.filter(t => t.status === status);
      if (customerName) {
        const kw = customerName.trim().toLowerCase();
        list = list.filter(t => t.customerName.toLowerCase().includes(kw));
      }
      if (dateFrom) list = list.filter(t => t.createdAt >= dateFrom);
      if (dateTo) list = list.filter(t => t.createdAt <= dateTo);
      const p = Number(page);
      const ps = Number(pageSize);
      return {
        code: 0,
        total: list.length,
        data: list.slice((p - 1) * ps, p * ps),
      };
    },
  },
  {
    // 到期提醒独立于分页，扫描全量任务返回 2 个工作日内到期的任务
    url: '/api/tasks/due-soon',
    method: 'get',
    response: () => ({
      code: 0,
      data: mockTasks.filter(t => t.daysUntilDue !== null && t.daysUntilDue <= 2),
    }),
  },
  {
    url: '/api/task/:id',
    method: 'get',
    response: (opt: { url: string }) => ({
      code: 0,
      data: mockTasks.find(t => t.id === lastSeg(opt.url)),
    }),
  },
  {
    url: '/api/task/submit/:id',
    method: 'post',
    response: (opt: { url: string; body: { customer: Customer; attachments: Attachment[] } }) => {
      const task = mockTasks.find(t => t.id === lastSeg(opt.url));
      if (task) {
        task.status = TaskStatus.Submitted;
        task.attachments = opt.body.attachments;
        const customer = mockCustomers.find(c => c.id === task.customerId);
        if (customer) Object.assign(customer, opt.body.customer);
      }
      return { code: 0 };
    },
  },
  {
    url: '/api/task/return/:id',
    method: 'post',
    response: (opt: { url: string }) => {
      const task = mockTasks.find(t => t.id === lastSeg(opt.url));
      if (task) task.status = TaskStatus.Returned;
      return { code: 0 };
    },
  },
  {
    url: '/api/task/approve/:id',
    method: 'post',
    response: (opt: { url: string }) => {
      const task = mockTasks.find(t => t.id === lastSeg(opt.url));
      if (task) task.status = TaskStatus.Approved;
      return { code: 0 };
    },
  },
];
