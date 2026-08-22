import dayjs from 'dayjs';
import type { MessageRecord } from '@/types';
import {
  BUSINESS_STATUS_LABELS,
  BUSINESS_TYPE_LABELS,
  MESSAGE_DIRECTION_LABELS,
  TRANSMISSION_STATUS_LABELS,
} from '@/types/enums';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/** 将详情公共字段转换为只读表单值；只转换展示格式，不补空值。 */
export const toMessageBasicFormData = (record: MessageRecord): Record<string, unknown> => ({
  ...record,
  msgDirection: resolveLabel(MESSAGE_DIRECTION_LABELS, record.msgDirection),
  businessType: resolveLabel(BUSINESS_TYPE_LABELS, record.businessType),
  transmissionStatus: resolveLabel(TRANSMISSION_STATUS_LABELS, record.transmissionStatus),
  businessStatus: resolveLabel(BUSINESS_STATUS_LABELS, record.businessStatus),
  msgRecvDate: formatDateTime(record.msgRecvDate),
  msgSendTime: formatDateTime(record.msgSendTime),
  messageTime: formatDateTime(record.messageTime),
  createTime: formatDateTime(record.createTime),
  updateTime: formatDateTime(record.updateTime),
});

const resolveLabel = (labels: Record<string, string>, value: string) => labels[value] ?? value;

const formatDateTime = (value: string | null) => {
  if (!value) return value;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(DATE_TIME_FORMAT) : value;
};
