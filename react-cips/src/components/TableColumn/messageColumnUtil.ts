import dayjs from 'dayjs';
import { formatMessageAmount } from '@/utils';

/** 表格空值统一展示为 --，但不修改数据本身。 */
export const renderMessageText = (value: unknown) =>
  value === undefined || value === null || value === '' ? '--' : String(value);

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

/** 报文列表金额展示 */
export const renderMessageAmount = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '--';
  return formatMessageAmount(String(value));
};
