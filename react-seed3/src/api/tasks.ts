import { get, post, Pagination } from './request';
import type { Attachment, Customer, Task } from '@/types';
import { TaskStatus } from '@/types/enums';

export interface TaskQuery {
  current: number;
  pageSize: number;
  status?: string;
  cusId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PagedTasks extends Pagination {
  list: Task[];
}

export const getTasks = (params: TaskQuery) => post<PagedTasks>('/api/tasks', params);

export const getTask = (id: string) => get<Task>(`/api/task/${id}`);

export const getCustomer = (cusId: string) => get<Customer>(`/api/customer/${cusId}`);

// 附件上传走专门的接口，成功后由后端直接返回落库的附件信息（fileId/filePath 等）
export const uploadAttachment = (taskId: string, file: File) =>
  post<Attachment>(`/api/task/${taskId}/attachment`, {
    fileName: file.name,
    fileSize: String(file.size),
  });

export interface TaskStatusPayload {
  // 表单值与接口原始 Customer 的差异字段（即高亮字段），JSON 字符串
  newValue: string;
  attachments: Attachment[];
}

export interface TaskStatusChange {
  id: string;
  status: TaskStatus;
  inputId?: string;
  authoriserId?: string;
  payload?: TaskStatusPayload;
}

// 统一的任务状态变更入口：submit/return/approve/cancel 均走 /api/task/status（POST body）
const changeTaskStatus = (body: TaskStatusChange) => post('/api/task/status', body);

export const submitTask = (id: string, payload: TaskStatusPayload, inputId: string) =>
  changeTaskStatus({ id, status: TaskStatus.Submitted, inputId, payload });

export const returnTask = (id: string, authoriserId: string) =>
  changeTaskStatus({ id, status: TaskStatus.Returned, authoriserId });

export const approveTask = (id: string, authoriserId: string) =>
  changeTaskStatus({ id, status: TaskStatus.Approved, authoriserId });

export const cancelTask = (id: string, inputId: string) =>
  changeTaskStatus({ id, status: TaskStatus.Cancelled, inputId });
