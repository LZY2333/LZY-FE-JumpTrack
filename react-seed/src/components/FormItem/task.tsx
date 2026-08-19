import { DatePicker, Form, Input, Select } from 'antd';
import type { FormItemProps } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
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

const disableFutureDate = (current: Dayjs) => current.isAfter(dayjs(), 'day');
const RECENT_DATE_PRESETS = [
  {
    label: 'Past Week',
    value: (): [Dayjs, Dayjs] => [dayjs().subtract(1, 'week').startOf('day'), dayjs().endOf('day')],
  },
  {
    label: 'Past Month',
    value: (): [Dayjs, Dayjs] => [dayjs().subtract(1, 'month').startOf('day'), dayjs().endOf('day')],
  },
  {
    label: 'Past 3 Months',
    value: (): [Dayjs, Dayjs] => [dayjs().subtract(3, 'months').startOf('day'), dayjs().endOf('day')],
  },
];

export const TaskStatusFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item {...props} name='status' label='Status' initialValue=''>
    <Select className='w-full' options={STATUS_OPTIONS} />
  </Form.Item>
);

export const TaskIdFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item {...props} name='taskId' label='Task ID' initialValue=''>
    <Input allowClear placeholder='Filter by Task ID' />
  </Form.Item>
);

export const TaskNameFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item {...props} name='taskName' label='Task Name' initialValue=''>
    <Input allowClear placeholder='Filter by Task Name' />
  </Form.Item>
);

export const TaskCreateTimeRangeFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item {...props} name='createTimeRange' label='Created Date' initialValue={null}>
    <DatePicker.RangePicker className='w-full' disabledDate={disableFutureDate} presets={RECENT_DATE_PRESETS} />
  </Form.Item>
);

export const TaskUpdateTimeRangeFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item {...props} name='updateTimeRange' label='Updated Date' initialValue={null}>
    <DatePicker.RangePicker className='w-full' disabledDate={disableFutureDate} presets={RECENT_DATE_PRESETS} />
  </Form.Item>
);

export const TaskName = (props: TaskDetailFormItemProps) => (
  <Form.Item
    {...props}
    name='taskName'
    label='Task Name'
    initialValue=''
    rules={[{ required: true, message: 'Please enter task name' }]}
  >
    <Input maxLength={100} showCount />
  </Form.Item>
);

export const TaskDescription = (props: TaskDetailFormItemProps) => (
  <Form.Item {...props} name='description' label='Description' initialValue=''>
    <Input.TextArea rows={5} maxLength={500} showCount />
  </Form.Item>
);
