import { TaskStatus } from '@/types/enums';
import type { Task, TaskDetail } from '@/types';
import { mockTaskDetail } from './taskDetail';

// 模块级可变数组：Node.js 模块单例，dev server 进程存活期间状态持久，mock 接口直接修改此数组
export const mockTasks: Task[] = [
  { id: 'T0001', refNo: 'T0001', customerName: 'Chen Wen 陈文', createdAt: '2026-06-14', status: TaskStatus.Pending, daysUntilDue: 4 },
  { id: 'T0002', refNo: 'T0002', customerName: 'Li Ming 李明', createdAt: '2026-06-13', status: TaskStatus.PendingChecker, daysUntilDue: 2 },
  { id: 'T0003', refNo: 'T0003', customerName: 'Wang Fang 王芳', createdAt: '2026-06-12', status: TaskStatus.Return, daysUntilDue: 1 },
  { id: 'T0004', refNo: 'T0004', customerName: 'Zhang Wei 张伟', createdAt: '2026-06-11', status: TaskStatus.Done, daysUntilDue: null },
  { id: 'T0005', refNo: 'T0005', customerName: 'Liu Yang 刘洋', createdAt: '2026-06-10', status: TaskStatus.Pending, daysUntilDue: 3 },
];

// vite-plugin-mock v2 不在 response 回调中暴露路径参数，只能从 URL 字符串手动解析
// '/api/task/submit/T0001' → split → ['', 'api', 'task', 'submit', 'T0001'] → [4]
function extractId(url: string): string {
  return url.split('/')[4];
}

export default [
  {
    url: '/api/tasks',
    method: 'get',
    response: () => ({ code: 0, data: mockTasks }),
  },
  {
    url: '/api/task/submit/:id',
    method: 'post',
    response: (opt: { url: string; body: TaskDetail }) => {
      const task = mockTasks.find(t => t.id === extractId(opt.url));
      if (task) task.status = TaskStatus.PendingChecker;
      Object.assign(mockTaskDetail, opt.body);
      return { code: 0 };
    },
  },
  {
    url: '/api/task/return/:id',
    method: 'post',
    response: (opt: { url: string }) => {
      const task = mockTasks.find(t => t.id === extractId(opt.url));
      if (task) task.status = TaskStatus.Return;
      return { code: 0 };
    },
  },
  {
    url: '/api/task/approve/:id',
    method: 'post',
    response: (opt: { url: string }) => {
      const task = mockTasks.find(t => t.id === extractId(opt.url));
      if (task) task.status = TaskStatus.Done;
      return { code: 0 };
    },
  },
];
