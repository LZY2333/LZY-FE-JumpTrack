import request, { ApiResult } from './request';
import type { Attachment, Customer, Task } from '@/types';

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
    .get<ApiResult<Task[]>, ApiResult<Task[]>>('/api/tasks', { params })
    .then(res => ({ data: res.data, total: res.total ?? 0 }));

export const getDueTasks = () =>
  request.get<ApiResult<Task[]>, ApiResult<Task[]>>('/api/tasks/due-soon').then(res => res.data);

export const getTask = (id: string) =>
  request.get<ApiResult<Task>, ApiResult<Task>>(`/api/task/${id}`).then(res => res.data);

export const getCustomer = (customerId: string) =>
  request.get<ApiResult<Customer>, ApiResult<Customer>>(`/api/customer/${customerId}`).then(res => res.data);

export const submitTask = (id: string, payload: { customer: Customer; attachments: Attachment[] }) =>
  request.post(`/api/task/submit/${id}`, payload);

export const returnTask = (id: string) =>
  request.post(`/api/task/return/${id}`);

export const approveTask = (id: string) =>
  request.post(`/api/task/approve/${id}`);
