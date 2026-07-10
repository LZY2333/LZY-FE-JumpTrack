import { Badge } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { TaskStatus } from '@/types/enums';
import type { Task } from '@/types';

const STATUS_COLOR: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'blue',
  [TaskStatus.Cancelled]: 'default',
  [TaskStatus.Submitted]: 'purple',
  [TaskStatus.Returned]: 'orange',
  [TaskStatus.Approved]: 'green',
};

export const taskId: ColumnType<Task> = { title: 'Task ID', dataIndex: 'taskId', width: 100 };

export const taskName: ColumnType<Task> = { title: 'Task Name', dataIndex: 'taskName' };

export const cusId: ColumnType<Task> = { title: 'Customer ID (CIF)', dataIndex: 'cusId' };

export const inputId: ColumnType<Task> = {
  title: 'Maker',
  dataIndex: 'inputId',
  width: 100,
  render: (inputId: string) => inputId || '-',
};

export const authoriserId: ColumnType<Task> = {
  title: 'Checker',
  dataIndex: 'authoriserId',
  width: 100,
  render: (authoriserId: string) => authoriserId || '-',
};

export const createDate: ColumnType<Task> = { title: 'Created Date', dataIndex: 'createDate', width: 120 };

export const taskStatus: ColumnType<Task> = {
  title: 'Status',
  dataIndex: 'taskStatus',
  width: 160,
  render: (status: TaskStatus) => <Badge color={STATUS_COLOR[status]} text={status} />,
};
