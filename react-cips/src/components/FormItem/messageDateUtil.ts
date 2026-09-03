import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { RangePickerProps } from 'antd/es/date-picker';

const MESSAGE_DATE_MONTH_LIMIT = 3;

/** 点击时计算快捷日期，避免页面长时间停留后仍使用旧日期。 */
export const messageDatePresets: RangePickerProps['presets'] = [
  { label: '1 Day', value: () => getRecentMessageDates(0, 'day') },
  { label: '1 Week', value: () => getRecentMessageDates(6, 'day') },
  { label: '2 Weeks', value: () => getRecentMessageDates(13, 'day') },
  { label: '1 Month', value: () => getRecentMessageDates(1, 'month') },
  { label: '3 Months', value: () => getRecentMessageDates(MESSAGE_DATE_MONTH_LIMIT, 'month') },
];

/** 仅允许选择最近三个自然月内的日期，包含边界日和今天。 */
export const isMessageDateDisabled = (date: Dayjs): boolean => {
  const today = dayjs().startOf('day');
  return date.isBefore(today.subtract(MESSAGE_DATE_MONTH_LIMIT, 'month'), 'day') || date.isAfter(today, 'day');
};

/** 日、周按包含今天的天数计算；月份按自然月回溯，查询覆盖起止整日。 */
const getRecentMessageDates = (amount: number, unit: 'day' | 'month'): [Dayjs, Dayjs] => {
  const today = dayjs();
  return [today.subtract(amount, unit).startOf('day'), today.endOf('day')];
};
