import dayjs from 'dayjs';
import type { NullableText } from '@/types';

const AMOUNT_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 表格空值统一展示为 --，但不修改数据本身。 */
export const renderMessageText = (value: unknown) =>
  value === undefined || value === null || value === '' ? '--' : String(value);

/** 报文归属按“部门 / 组”展示 */
export const renderMessageOwnerBy = (department: NullableText, group: NullableText) => {
  const ownerParts = [department, group].filter(Boolean);
  if (ownerParts.length < 2) return ownerParts[0] ?? '--';
  return ownerParts.join(' / ');
};

/** DateTime转换 */
export const renderMessageDateTime = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '--';
  const date = dayjs(String(value));
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : String(value);
};

/** Date转换 */
export const renderMessageDate = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '--';
  const date = dayjs(String(value));
  return date.isValid() ? date.format('YYYY-MM-DD') : String(value);
};

/** 金额 两位小数转换 */
export const renderMessageAmount = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '--';
  const amount = Number(value);
  return Number.isFinite(amount) ? AMOUNT_FORMATTER.format(amount) : String(value);
};
