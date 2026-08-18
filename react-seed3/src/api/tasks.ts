import { get, getBlob, post, Pagination } from './request';
import type { Attachment, Task } from '@/types';
import { TaskStatus } from '@/types/enums';

export type TaskSortField = 'taskId' | 'taskName' | 'createTime' | 'updateTime';
export type TaskSortOrder = 'asc' | 'desc';

export interface TaskQuery {
  current: number;
  pageSize: number;
  status?: string;
  taskId?: string;
  taskName?: string;
  createTimeFrom?: string;
  createTimeTo?: string;
  updateTimeFrom?: string;
  updateTimeTo?: string;
  sortField?: TaskSortField;
  sortOrder?: TaskSortOrder;
}

export interface PagedTasks extends Pagination {
  list: Task[];
}

/** 明细页聚合响应，附件内容仍通过 Blob 下载接口单独获取。 */
export interface TaskPageData {
  task: Task;
  attachments: Attachment[];
}

export const getTasks = (params: TaskQuery) => post<PagedTasks>('/api/cies/v1/task/getTasks', params);

/** 一次获取详情页初始化所需的任务与附件元数据。 */
export const getTaskPageData = (taskId: string) =>
  get<TaskPageData>(`/api/cies/v1/task/detail/${encodeURIComponent(taskId)}`);

export const getTask = (taskId: string) => get<Task>(`/api/cies/v1/task/${encodeURIComponent(taskId)}`);

/** 获取任务关联的附件列表；Task DTO 本身不携带附件。 */
export const getAttachments = (taskId: string) =>
  get<Attachment[]>(`/api/cies/v1/task/attachments/${encodeURIComponent(taskId)}`);

/** 下载附件原始文件；文件名由调用方根据 Attachment.fileName 处理。 */
export const downloadAttachment = (fileName: string) =>
  getBlob(`/api/cies/v1/task/attachment/download/${encodeURIComponent(fileName)}`);

export interface TaskStatusPayload {
  /** 提交时保存的任务名称。 */
  taskName: string;
  /** 提交时保存的任务描述。 */
  description: string;
}

export interface TaskStatusChange {
  taskId: string;
  taskStatus: TaskStatus;
  makerId?: string;
  checkerId?: string;
  taskRemark?: string;
  payload?: TaskStatusPayload;
}

// 统一的任务状态变更入口：submit/return/approve/cancel 均走 /api/cies/v1/task/status（POST body）
const changeTaskStatus = (body: TaskStatusChange) => post('/api/cies/v1/task/status', body);

export const submitTask = (taskId: string, payload: TaskStatusPayload, makerId: string) =>
  changeTaskStatus({ taskId, taskStatus: TaskStatus.Submitted, makerId, payload });

export const returnTask = (taskId: string, checkerId: string, taskRemark: string) =>
  changeTaskStatus({ taskId, taskStatus: TaskStatus.Returned, checkerId, taskRemark });

export const approveTask = (taskId: string, checkerId: string) =>
  changeTaskStatus({ taskId, taskStatus: TaskStatus.Approved, checkerId });

export const cancelTask = (taskId: string, makerId: string) =>
  changeTaskStatus({ taskId, taskStatus: TaskStatus.Cancelled, makerId });
