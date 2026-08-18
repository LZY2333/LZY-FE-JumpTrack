import { DatePicker, Form, Input, Select } from 'antd';
import type { FormItemProps } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import { TaskStatus } from '@/types/enums';

type TaskFilterFormItemProps = Omit<FormItemProps, 'label' | 'name'>;
type TaskDetailFormItemProps = Omit<FormItemProps, 'label' | 'name'>;

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
};

export const TaskStatusFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item {...props} name='status' label='Status'>
    <Select className='w-full' options={STATUS_OPTIONS} />
  </Form.Item>
);

export const TaskIdFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item {...props} name='taskId' label='Task ID'>
    <Input allowClear placeholder='Filter by Task ID' />
  </Form.Item>
);

export const TaskNameFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item {...props} name='taskName' label='Task Name'>
    <Input allowClear placeholder='Filter by Task Name' />
  </Form.Item>
);

export const TaskCreateTimeRangeFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item {...props} name='createTimeRange' label='Created Date'>
    <DatePicker.RangePicker className='w-full' disabledDate={disableFutureDate} ranges={RECENT_DATE_RANGES} />
  </Form.Item>
);

export const TaskUpdateTimeRangeFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item {...props} name='updateTimeRange' label='Updated Date'>
    <DatePicker.RangePicker className='w-full' disabledDate={disableFutureDate} ranges={RECENT_DATE_RANGES} />
  </Form.Item>
);

export const TaskName = (props: TaskDetailFormItemProps) => (
  <Form.Item
    {...props}
    name='taskName'
    label='Task Name'
    rules={[{ required: true, message: 'Please enter task name' }]}
  >
    <Input maxLength={100} showCount />
  </Form.Item>
);

export const TaskDescription = (props: TaskDetailFormItemProps) => (
  <Form.Item {...props} name='description' label='Description'>
    <Input.TextArea rows={5} maxLength={500} showCount />
  </Form.Item>
);
