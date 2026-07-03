import request, { ApiResult } from './request';
import type { Attachment, Customer, Task } from '@/types';
import { TaskStatus } from '@/types/enums';

export interface TaskQuery {
  page: number;
  pageSize: number;
  status?: string;
  cusId?: string;
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

export const getTask = (id: string) =>
  request.get<ApiResult<Task>, ApiResult<Task>>(`/api/task/${id}`).then(res => res.data);

export const getCustomer = (cusId: string) =>
  request.get<ApiResult<Customer>, ApiResult<Customer>>(`/api/customer/${cusId}`).then(res => res.data);

// 附件上传走专门的接口，成功后由后端直接返回落库的附件信息（fileId/filePath 等）
export const uploadAttachment = (taskId: string, file: File) =>
  request
    .post<ApiResult<Attachment>, ApiResult<Attachment>>(`/api/task/${taskId}/attachment`, {
      fileName: file.name,
      fileSize: String(file.size),
    })
    .then(res => res.data);

export interface TaskStatusPayload {
  customer: Customer;
  attachments: Attachment[];
}

export interface TaskStatusChange {
  id: string;
  status: TaskStatus;
  inputId?: string;
  payload?: TaskStatusPayload;
}

// 统一的任务状态变更入口：submit/return/approve/cancel 均走 /api/task/status（POST body）
const changeTaskStatus = (body: TaskStatusChange) => request.post('/api/task/status', body);

export const submitTask = (id: string, payload: TaskStatusPayload, inputId: string) =>
  changeTaskStatus({ id, status: TaskStatus.Submitted, inputId, payload });

export const returnTask = (id: string) =>
  changeTaskStatus({ id, status: TaskStatus.Returned });

export const approveTask = (id: string) =>
  changeTaskStatus({ id, status: TaskStatus.Approved });

export const cancelTask = (id: string) =>
  changeTaskStatus({ id, status: TaskStatus.Cancelled });
