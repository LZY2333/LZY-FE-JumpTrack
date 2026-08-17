import { Tag } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { TaskStatus, TranType } from '@/types/enums';
import type { Task } from '@/types';

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

const TRAN_TYPE_LABEL: Record<TranType, string> = {
  [TranType.DailyReport]: 'NCIES Daily Report',
  [TranType.AnnualReport]: 'NCIES Annual Report',
  [TranType.AdHocReport]: 'NCIES Ad-hoc Report',
  [TranType.AipReport]: 'NCIES AIP Report',
  [TranType.InformationAmendment]: 'NCIES Information Amendment',
};

export const taskId: ColumnType<Task> = { title: 'Task ID', dataIndex: 'taskId', width: 100, sorter: true };

export const tranType: ColumnType<Task> = {
  title: 'Task Name',
  dataIndex: 'tranType',
  render: (tranType: TranType) => TRAN_TYPE_LABEL[tranType] || tranType,
};

export const cusId: ColumnType<Task> = { title: 'Customer ID (CIF)', dataIndex: 'cusId' };

export const customerName: ColumnType<Task> = {
  title: 'Customer Name',
  key: 'customerName',
  width: 180,
  render: (_, task) => [task.cusEnName, task.cusCnName].filter(Boolean).join(' / ') || '-',
};

export const makerId: ColumnType<Task> = {
  title: 'Maker',
  dataIndex: 'makerId',
  width: 80,
  render: (makerId: string) => makerId || '-',
};

export const checkerId: ColumnType<Task> = {
  title: 'Checker',
  dataIndex: 'checkerId',
  width: 80,
  render: (checkerId: string) => checkerId || '-',
};

export const createTime: ColumnType<Task> = {
  title: 'Task Date',
  dataIndex: 'createTime',
  width: 130,
  sorter: true,
};

export const transactionTime: ColumnType<Task> = {
  title: 'Transaction Date',
  dataIndex: 'transactionTime',
  width: 130,
  sorter: true,
};

export const updateTime: ColumnType<Task> = {
  title: 'Update Date',
  dataIndex: 'updateTime',
  width: 130,
  sorter: true,
};

export const taskStatus: ColumnType<Task> = {
  title: 'Status',
  dataIndex: 'taskStatus',
  width: 110,
  render: (taskStatus: TaskStatus) => (
    <Tag color={STATUS_COLOR[taskStatus]}>{STATUS_LABEL[taskStatus] || taskStatus}</Tag>
  ),
};
