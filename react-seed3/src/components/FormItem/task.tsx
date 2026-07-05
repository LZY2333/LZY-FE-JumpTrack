import { DatePicker, Form, Input, Select } from 'antd';
import type { FormItemProps } from 'antd';
import { TaskStatus } from '@/types/enums';

// task 业务筛选字段：任务池顶部的状态/客户号/日期筛选项。
// 与 customer.tsx 一致，字段经 Form name 绑定，由调用方 Form 实例统一管理值，
// 组件只固定 name / label / 录入控件，其余属性经 {...props} 透传。

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: TaskStatus.Pending, label: 'Pending' },
  { value: TaskStatus.Cancelled, label: 'Cancelled' },
  { value: TaskStatus.Submitted, label: 'Submitted' },
  { value: TaskStatus.Returned, label: 'Returned' },
  { value: TaskStatus.Approved, label: 'Approved' },
];

export function TaskStatusFilter(props: FormItemProps) {
  return (
    <Form.Item name='status' label='Status' {...props}>
      <Select className='w-full' options={STATUS_OPTIONS} />
    </Form.Item>
  );
}

export function TaskCusIdFilter(props: FormItemProps) {
  return (
    <Form.Item name='cusId' label='Customer ID' {...props}>
      <Input allowClear placeholder='Filter by Customer ID (CIF)' />
    </Form.Item>
  );
}

export function TaskDateRangeFilter(props: FormItemProps) {
  return (
    <Form.Item name='dateRange' label='Created Date' {...props}>
      <DatePicker.RangePicker className='w-full' />
    </Form.Item>
  );
}
