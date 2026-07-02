import request, { ApiResult } from './request';
import type { Attachment, Customer, Task } from '@/types';
import { TaskStatus } from '@/types/enums';

export interface TaskQuery {
  page: number;
  pageSize: number;
  status?: string;
  customerName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PagedTasks {
  data: Task[];
  total: number;
}

export const getTasks = (params: TaskQuery): Promise<PagedTasks> =>
  request
    .post<ApiResult<Task[]>, ApiResult<Task[]>>('/api/tasks', params)
    .then(res => ({ data: res.data, total: res.total ?? 0 }));

export const getDueTasks = () =>
  request.get<ApiResult<Task[]>, ApiResult<Task[]>>('/api/tasks/due-soon').then(res => res.data);

export const getTask = (id: string) =>
  request.get<ApiResult<Task>, ApiResult<Task>>(`/api/task/${id}`).then(res => res.data);

export const getCustomer = (customerId: string) =>
  request.get<ApiResult<Customer>, ApiResult<Customer>>(`/api/customer/${customerId}`).then(res => res.data);

export interface TaskStatusPayload {
  customer: Customer;
  attachments: Attachment[];
}

export interface TaskStatusChange {
  id: string;
  status: TaskStatus;
  makerId?: string;
  payload?: TaskStatusPayload;
}

// 统一的任务状态变更入口：submit/return/approve/cancel 均走 /api/task/status（POST body）
const changeTaskStatus = (body: TaskStatusChange) => request.post('/api/task/status', body);

export const submitTask = (id: string, payload: TaskStatusPayload, makerId: string) =>
  changeTaskStatus({ id, status: TaskStatus.Submitted, makerId, payload });

export const returnTask = (id: string) =>
  changeTaskStatus({ id, status: TaskStatus.Returned });

export const approveTask = (id: string) =>
  changeTaskStatus({ id, status: TaskStatus.Approved });

export const cancelTask = (id: string) =>
  changeTaskStatus({ id, status: TaskStatus.Cancelled });
