import { get, post } from './request';
import type { Pagination } from './request';
import type { Task } from '@/types';
import { TaskStatus } from '@/types/enums';

const TASK_API = '/api/example/v1/tasks';

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

export interface TaskUpdate {
  taskStatus: TaskStatus;
  operatorId: string;
  taskName?: string;
  description?: string;
  taskRemark?: string;
}

export const getTasks = (params: TaskQuery) => post<PagedTasks>(`${TASK_API}/query`, params);

export const getTask = (taskId: string) => get<Task>(`${TASK_API}/${encodeURIComponent(taskId)}`);

export const updateTask = (taskId: string, body: TaskUpdate) => post(`${TASK_API}/${encodeURIComponent(taskId)}`, body);
