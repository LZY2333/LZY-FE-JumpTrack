import type { MessageDetail, MessageRecord } from '@/types';
import {
  MESSAGE_BUSINESS_TYPE_LABELS,
  MESSAGE_DIRECTION_LABELS,
  MSG_RECV_STATUS_LABELS,
  MSG_SEND_STATUS_LABELS,
} from '@/types/enums';

/** 获取报文明细展示编号。 */
export const resolveDisplayMessageId = (detail: MessageDetail | null, messageId?: string) =>
  detail?.msgBasicInfo.msgId || messageId || '--';

/** 构造 Basic Info 展示数据。 */
export const toMessageBasicFormData = (record: MessageRecord): Record<string, unknown> => ({
  ...record,
  msgDirection: resolveLabel(MESSAGE_DIRECTION_LABELS, record.msgDirection),
  businessType: record.businessType
    ? resolveLabel(MESSAGE_BUSINESS_TYPE_LABELS, record.businessType)
    : record.businessType,
  msgRecvStatus: record.msgRecvStatus
    ? resolveLabel(MSG_RECV_STATUS_LABELS, record.msgRecvStatus)
    : record.msgRecvStatus,
  msgSendStatus: record.msgSendStatus
    ? resolveLabel(MSG_SEND_STATUS_LABELS, record.msgSendStatus)
    : record.msgSendStatus,
});

/** 获取枚举展示文案。 */
const resolveLabel = <Value extends string>(labels: Record<Value, string>, value: Value) =>
  labels[value] || value || '--';
