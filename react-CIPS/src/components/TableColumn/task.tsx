import { Badge } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { TaskStatus, TranType } from '@/types/enums';
import type { Task } from '@/types';

const STATUS_COLOR: Record<TaskStatus, string> = {
  [TaskStatus.Pending]: 'blue',
  [TaskStatus.Submitted]: 'purple',
  [TaskStatus.Approved]: 'green',
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
  title: 'Created Date',
  dataIndex: 'createTime',
  width: 160,
  sorter: true,
};

export const updateTime: ColumnType<Task> = {
  title: 'Update Date',
  dataIndex: 'updateTime',
  width: 160,
  sorter: true,
};

export const taskStatus: ColumnType<Task> = {
  title: 'Status',
  dataIndex: 'taskStatus',
  width: 110,
  render: (taskStatus: TaskStatus) => (
    <Badge color={STATUS_COLOR[taskStatus]} text={STATUS_LABEL[taskStatus] || taskStatus} />
  ),
};
