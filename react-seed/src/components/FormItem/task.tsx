import { DatePicker, Form, Input, Select } from 'antd';
import type { FormItemProps } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { TaskStatus } from '@/types/enums';

type TaskFilterFormItemProps = Omit<FormItemProps, 'label' | 'name'>;
type TaskDetailFormItemProps = Omit<FormItemProps, 'label' | 'name'>;
type TaskDateRange = [string, string] | null;

const DATE_FORMAT = 'YYYY-MM-DD';
const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: TaskStatus.Pending, label: 'Pending' },
  { value: TaskStatus.Submitted, label: 'Submitted' },
  { value: TaskStatus.Approved, label: 'Approved' },
  { value: TaskStatus.Returned, label: 'Returned' },
  { value: TaskStatus.Cancelled, label: 'Cancelled' },
];

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

/** 任务状态筛选字段。 */
export const TaskStatusFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item {...props} name='status' label='Status' initialValue=''>
    <Select className='w-full' options={STATUS_OPTIONS} />
  </Form.Item>
);

/** 任务 ID 筛选字段。 */
export const TaskIdFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item {...props} name='taskId' label='Task ID' initialValue='' normalize={trimWhitespace}>
    <Input allowClear placeholder='Filter by Task ID' />
  </Form.Item>
);

/** 任务名称筛选字段。 */
export const TaskNameFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item {...props} name='taskName' label='Task Name' initialValue='' normalize={trimWhitespace}>
    <Input allowClear placeholder='Filter by Task Name' />
  </Form.Item>
);

/** 任务创建日期范围筛选字段。 */
export const TaskCreateTimeRangeFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item
    {...props}
    name='createTimeRange'
    label='Created Date'
    initialValue={null}
    getValueFromEvent={getFormattedDateRange}
    getValueProps={getDateRangeValueProps}
  >
    <DatePicker.RangePicker
      className='w-full'
      format={DATE_FORMAT}
      disabledDate={disableFutureDate}
      presets={RECENT_DATE_PRESETS}
    />
  </Form.Item>
);

/** 任务更新日期范围筛选字段。 */
export const TaskUpdateTimeRangeFilter = (props: TaskFilterFormItemProps) => (
  <Form.Item
    {...props}
    name='updateTimeRange'
    label='Updated Date'
    initialValue={null}
    getValueFromEvent={getFormattedDateRange}
    getValueProps={getDateRangeValueProps}
  >
    <DatePicker.RangePicker
      className='w-full'
      format={DATE_FORMAT}
      disabledDate={disableFutureDate}
      presets={RECENT_DATE_PRESETS}
    />
  </Form.Item>
);

/** 任务名称编辑字段。 */
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

/** 任务描述编辑字段。 */
export const TaskDescription = (props: TaskDetailFormItemProps) => (
  <Form.Item {...props} name='description' label='Description' initialValue=''>
    <Input.TextArea rows={5} maxLength={500} showCount />
  </Form.Item>
);

/** 去除文本首尾的空白字符，保留文本内部空格。 */
const trimWhitespace = (value?: string) => value?.replace(/^\s+|\s+$/g, '') ?? '';
// const keepAlphanumeric = (value?: string) => (value ?? '').replace(/[^A-Za-z0-9]/g, '');
// const keepDigits = (value?: string) => (value ?? '').replace(/\D/g, '');
// const keepEnglish = (value?: string) => (value ?? '').replace(/[^A-Za-z ]/g, '');

/** 将日期控件的变更结果转换为表单直接提交的日期字符串。 */
const getFormattedDateRange = (_: unknown, dateStrings: [string, string]): TaskDateRange =>
  dateStrings[0] && dateStrings[1] ? dateStrings : null;

/** 将表单中的日期字符串转换为日期控件需要的受控值。 */
const getDateRangeValueProps = (value?: TaskDateRange) => ({
  value: value ? [dayjs(value[0]), dayjs(value[1])] : null,
});

/** 禁止选择晚于今天的日期。 */
const disableFutureDate = (current: Dayjs) => current.isAfter(dayjs(), 'day');
