import { DatePicker, Form, Input, Select } from 'antd';
import type { FormItemProps } from 'antd';
import { TaskStatus } from '@/types/enums';

// 任务查询表单的 UI 辅助组件；日期范围是前端组合值，提交时拆为起止日期，
// 因此日期筛选组件不属于 Task DTO 字段组件。

type TaskFilterFormItemProps = Omit<FormItemProps, 'label' | 'name'>;

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: TaskStatus.Pending, label: 'Pending' },
  { value: TaskStatus.Submitted, label: 'Submitted' },
  { value: TaskStatus.Approved, label: 'Approved' },
  { value: TaskStatus.Returned, label: 'Returned' },
  { value: TaskStatus.Cancelled, label: 'Cancelled' },
];

export function TaskStatusFilter(props: TaskFilterFormItemProps) {
  return (
    <Form.Item {...props} name='status' label='Status'>
      <Select className='w-full' options={STATUS_OPTIONS} />
    </Form.Item>
  );
}

export function TaskCusIdFilter(props: TaskFilterFormItemProps) {
  return (
    <Form.Item {...props} name='cusId' label='Customer ID'>
      <Input allowClear placeholder='Filter by Customer ID (CIF)' />
    </Form.Item>
  );
}

export function TaskIdFilter(props: TaskFilterFormItemProps) {
  return (
    <Form.Item {...props} name='taskId' label='Task ID'>
      <Input allowClear placeholder='Filter by Task ID' />
    </Form.Item>
  );
}

export function TaskDateRangeFilter(props: TaskFilterFormItemProps) {
  return (
    <Form.Item {...props} name='dateRange' label='Created Date'>
      <DatePicker.RangePicker className='w-full' />
    </Form.Item>
  );
}

export function TaskUpdateDateRangeFilter(props: TaskFilterFormItemProps) {
  return (
    <Form.Item {...props} name='updateDateRange' label='Update Date'>
      <DatePicker.RangePicker className='w-full' />
    </Form.Item>
  );
}
