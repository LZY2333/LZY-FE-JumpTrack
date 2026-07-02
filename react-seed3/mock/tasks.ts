import { Role, TaskStatus } from '@/types/enums';
import type { Attachment, Customer, Task } from '@/types';
import { mockCustomers } from './customer';
import { mockUsers } from './users';

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
  const makerUsers = mockUsers.filter(user => user.roles.includes(Role.Maker));
  return {
    id,
    refNo: id,
    customerName: NAMES[i % NAMES.length],
    createdAt: `2026-06-${String(28 - (i % 28)).padStart(2, '0')}`,
    status,
    daysUntilDue: closed ? null : i % 7,
    customerId: 'C0001',
    attachments: attachmentsFor(id),
    makerId: makerUsers[i % makerUsers.length].id,
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
    method: 'post',
    response: (opt: { body: TasksQuery }) => {
      const { page = '1', pageSize = '10', status, customerName, dateFrom, dateTo } = opt.body || {};
      let list = mockTasks;
      if (status) list = list.filter(task => task.status === status);
      if (customerName) {
        const kw = customerName.trim().toLowerCase();
        list = list.filter(task => task.customerName.toLowerCase().includes(kw));
      }
      if (dateFrom) list = list.filter(task => task.createdAt >= dateFrom);
      if (dateTo) list = list.filter(task => task.createdAt <= dateTo);
      const pageNum = Number(page);
      const ps = Number(pageSize);
      return {
        code: 0,
        total: list.length,
        data: list.slice((pageNum - 1) * ps, pageNum * ps),
      };
    },
  },
  {
    // 到期提醒独立于分页，扫描全量任务返回 2 个工作日内到期的任务
    url: '/api/tasks/due-soon',
    method: 'get',
    response: () => ({
      code: 0,
      data: mockTasks.filter(task => task.daysUntilDue !== null && task.daysUntilDue <= 2),
    }),
  },
  {
    url: '/api/task/:id',
    method: 'get',
    response: (opt: { url: string }) => ({
      code: 0,
      data: mockTasks.find(task => task.id === lastSeg(opt.url)),
    }),
  },
  {
    // 统一状态变更：body { id, status, payload? }；submit 时 payload 附带客户与附件
    url: '/api/task/status',
    method: 'post',
    response: (opt: { body: { id: string; status: TaskStatus; makerId?: string; payload?: { customer: Customer; attachments: Attachment[] } } }) => {
      const { id, status, makerId, payload } = opt.body || {};
      const task = mockTasks.find(item => item.id === id);
      if (task) {
        task.status = status;
        if (makerId) task.makerId = makerId;
        if (payload) {
          task.attachments = payload.attachments;
          const customer = mockCustomers.find(item => item.id === task.customerId);
          if (customer) Object.assign(customer, payload.customer);
        }
      }
      return { code: 0 };
    },
  },
];
