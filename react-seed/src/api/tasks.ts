import { get, post } from './request';
import type { Pagination } from './request';
import type { Task } from '@/types';
import type { TaskSortField } from '@/types/enums';
import { TaskStatus } from '@/types/enums';

const TASK_API = '/api/example/v1/tasks';

/** 任务查询接口约定的排序方向。 */
export type TaskQuerySortOrder = 'asc' | 'desc';

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
  sortOrder?: TaskQuerySortOrder;
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

/** 分页查询任务。 */
export const getTasks = (params: TaskQuery) => post<PagedTasks>(`${TASK_API}/query`, params);

/** 查询指定任务详情。 */
export const getTask = (taskId: string) => get<Task>(`${TASK_API}/${encodeURIComponent(taskId)}`);

/** 更新指定任务。 */
export const updateTask = (taskId: string, body: TaskUpdate) => post(`${TASK_API}/${encodeURIComponent(taskId)}`, body);
