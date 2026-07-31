import { DatePicker, Form, Input, Select } from 'antd';
import type { FormItemProps } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
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

const disableFutureDate = (current: Moment) => current.isAfter(moment(), 'day');
const RECENT_DATE_RANGES: Record<string, () => [Moment, Moment]> = {
  'Past Week': () => [moment().subtract(1, 'week').startOf('day'), moment().endOf('day')],
  'Past Month': () => [moment().subtract(1, 'month').startOf('day'), moment().endOf('day')],
  'Past 3 Months': () => [moment().subtract(3, 'months').startOf('day'), moment().endOf('day')],
  'Past 6 Months': () => [moment().subtract(6, 'months').startOf('day'), moment().endOf('day')],
  'Past Year': () => [moment().subtract(1, 'year').startOf('day'), moment().endOf('day')],
};

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

export function TaskCreateTimeRangeFilter(props: TaskFilterFormItemProps) {
  return (
    <Form.Item {...props} name='createTimeRange' label='Task Date'>
      <DatePicker.RangePicker className='w-full' disabledDate={disableFutureDate} ranges={RECENT_DATE_RANGES} />
    </Form.Item>
  );
}

export function TaskTransactionTimeRangeFilter(props: TaskFilterFormItemProps) {
  return (
    <Form.Item {...props} name='transactionTimeRange' label='Transaction Date'>
      <DatePicker.RangePicker className='w-full' disabledDate={disableFutureDate} ranges={RECENT_DATE_RANGES} />
    </Form.Item>
  );
}

export function TaskUpdateTimeRangeFilter(props: TaskFilterFormItemProps) {
  return (
    <Form.Item {...props} name='updateTimeRange' label='Update Date'>
      <DatePicker.RangePicker className='w-full' disabledDate={disableFutureDate} ranges={RECENT_DATE_RANGES} />
    </Form.Item>
  );
}
