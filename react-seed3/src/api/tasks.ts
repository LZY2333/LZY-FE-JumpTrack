import { get, getBlob, post, Pagination } from './request';
import type { Attachment, Customer, Task } from '@/types';
import { TaskStatus } from '@/types/enums';

export type TaskSortField = 'taskId' | 'createTime' | 'updateTime';
export type TaskSortOrder = 'asc' | 'desc';

export interface TaskQuery {
  current: number;
  pageSize: number;
  status?: string;
  taskId?: string;
  cusId?: string;
  dateFrom?: string;
  dateTo?: string;
  updateDateFrom?: string;
  updateDateTo?: string;
  sortField?: TaskSortField;
  sortOrder?: TaskSortOrder;
}

export interface PagedTasks extends Pagination {
  list: Task[];
}

/** 明细页聚合响应，仅用于页面查询，不扩充 Task DTO。 */
export interface TaskPageData {
  task: Task;
  /** 数据仓中的原始客户信息，用于字段高亮比较。 */
  customer: Customer;
  /** 任务保存的完整客户变更信息；尚未保存变更时为 null。 */
  customerChange: Customer | null;
  /** 当前任务的附件元数据，附件内容仍通过下载接口单独获取。 */
  attachments: Attachment[];
}

export const getTasks = (params: TaskQuery) => post<PagedTasks>('/api/tasks', params);

export const getTask = (taskId: string) => get<Task>(`/api/task/${encodeURIComponent(taskId)}`);

/** 一次获取明细页初始化所需的任务、客户、客户变更及附件元数据。 */
export const getTaskPageData = (taskId: string) => get<TaskPageData>(`/api/task/${encodeURIComponent(taskId)}/detail`);

export const getCustomer = (cusId: string) => get<Customer>(`/api/customer/${encodeURIComponent(cusId)}`);

/** 获取任务保存的完整客户变更信息；尚未保存变更时返回 null。 */
export const getCustomerChange = (taskId: string) =>
  get<Customer | null>(`/api/task/${encodeURIComponent(taskId)}/customer-change`);

/** 获取任务关联的附件列表；Task DTO 本身不携带附件。 */
export const getAttachments = (taskId: string) =>
  get<Attachment[]>(`/api/task/${encodeURIComponent(taskId)}/attachments`);

/** 上传任务附件，成功后由后端返回不包含存储路径的附件信息。 */
export const uploadAttachment = (taskId: string, file: File) =>
  post<Attachment>(`/api/task/${encodeURIComponent(taskId)}/attachment`, {
    fileName: file.name,
    fileSize: String(file.size),
  });

/** 下载附件原始文件；文件名由调用方根据 Attachment.fileName 处理。 */
export const downloadAttachment = (fileId: string) => getBlob(`/api/attachment/${encodeURIComponent(fileId)}/download`);

export interface TaskStatusPayload {
  /** 完整的客户变更信息。 */
  customerChange: Customer;
  /** 当前附件列表，每次提交时全量携带。 */
  attachments: Attachment[];
}

export interface TaskStatusChange {
  taskId: string;
  taskStatus: TaskStatus;
  makerId?: string;
  checkerId?: string;
  taskRemark?: string;
  payload?: TaskStatusPayload;
}

// 统一的任务状态变更入口：submit/return/approve/cancel 均走 /api/task/status（POST body）
const changeTaskStatus = (body: TaskStatusChange) => post('/api/task/status', body);

export const submitTask = (taskId: string, payload: TaskStatusPayload, makerId: string) =>
  changeTaskStatus({ taskId, taskStatus: TaskStatus.Submitted, makerId, payload });

export const returnTask = (taskId: string, checkerId: string, taskRemark: string) =>
  changeTaskStatus({ taskId, taskStatus: TaskStatus.Returned, checkerId, taskRemark });

export const approveTask = (taskId: string, checkerId: string) =>
  changeTaskStatus({ taskId, taskStatus: TaskStatus.Approved, checkerId });

export const cancelTask = (taskId: string, makerId: string) =>
  changeTaskStatus({ taskId, taskStatus: TaskStatus.Cancelled, makerId });
