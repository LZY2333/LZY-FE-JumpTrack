import type { TableColumnType } from 'antd';
import { IOP_TASK_NODE_LABELS } from '@/types/enums';
import type { IopTaskInfo } from '@/types/iopTask';
import { renderMessageDateTime, renderMessageText } from './messageColumnUtil';

/** 任务编号: taskId */
export const iopTaskId: TableColumnType<IopTaskInfo> = {
  title: 'Task ID',
  dataIndex: 'taskId',
  width: 210,
  render: renderMessageText,
};

/** 任务流名称: taskFlowName */
export const iopTaskFlowName: TableColumnType<IopTaskInfo> = {
  title: 'Task Flow',
  dataIndex: 'taskFlowName',
  width: 240,
  render: renderMessageText,
};

/** 业务流水号: busRefNo */
export const iopTaskBusRefNo: TableColumnType<IopTaskInfo> = {
  title: 'Business Ref',
  dataIndex: 'busRefNo',
  width: 210,
  render: renderMessageText,
};

/** 当前环节: taskNode */
export const iopTaskNode: TableColumnType<IopTaskInfo> = {
  title: 'Current Node',
  dataIndex: 'taskNode',
  width: 180,
  render: (value: IopTaskInfo['taskNode']) => IOP_TASK_NODE_LABELS[value] ?? renderMessageText(value),
};

/** 经办人: inputId */
export const iopTaskInputId: TableColumnType<IopTaskInfo> = {
  title: 'Operator',
  dataIndex: 'inputId',
  width: 150,
  render: renderMessageText,
};

/** 经办时间: inputTime */
export const iopTaskInputTime: TableColumnType<IopTaskInfo> = {
  title: 'Input Time',
  dataIndex: 'inputTime',
  width: 180,
  render: renderMessageDateTime,
};
