import { Tag } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { Task } from '@/types';
import { TaskStatus } from '@/types/enums';

const STATUS_COLOR: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'green',
  [TaskStatus.Submitted]: 'blue',
  [TaskStatus.Approved]: 'purple',
  [TaskStatus.Returned]: 'orange',
  [TaskStatus.Cancelled]: 'default',
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'Pending',
  [TaskStatus.Submitted]: 'Submitted',
  [TaskStatus.Approved]: 'Approved',
  [TaskStatus.Returned]: 'Returned',
  [TaskStatus.Cancelled]: 'Cancelled',
};

export const taskId: ColumnType<Task> = { title: 'Task ID', dataIndex: 'taskId', width: 160, sorter: true };

export const taskName: ColumnType<Task> = {
  title: 'Task Name',
  dataIndex: 'taskName',
  width: 240,
  sorter: true,
  ellipsis: true,
};

export const makerId: ColumnType<Task> = {
  title: 'Maker',
  dataIndex: 'makerId',
  width: 130,
  render: (value: string) => value || '-',
};

export const checkerId: ColumnType<Task> = {
  title: 'Checker',
  dataIndex: 'checkerId',
  width: 130,
  render: (value: string) => value || '-',
};

export const createTime: ColumnType<Task> = {
  title: 'Created Date',
  dataIndex: 'createTime',
  width: 130,
  sorter: true,
};

export const updateTime: ColumnType<Task> = {
  title: 'Updated Date',
  dataIndex: 'updateTime',
  width: 130,
  sorter: true,
};

export const taskStatus: ColumnType<Task> = {
  title: 'Status',
  dataIndex: 'taskStatus',
  width: 110,
  render: (value: TaskStatus) => <Tag color={STATUS_COLOR[value]}>{STATUS_LABEL[value] || value}</Tag>,
};
