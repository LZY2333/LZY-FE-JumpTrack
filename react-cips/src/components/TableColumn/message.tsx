import type { TableColumnType } from 'antd';
import dayjs from 'dayjs';
import type { MessageRecord } from '@/types';
import {
  BUSINESS_TYPE_LABELS,
  BusinessType,
  MESSAGE_DIRECTION_LABELS,
  MessageDirection,
  TRANSMISSION_STATUS_LABELS,
  TransmissionStatus,
} from '@/types/enums';

const AMOUNT_FORMATTER = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 表格空值统一展示为 --，但不修改数据本身。 */
export const renderMessageText = (value: unknown) =>
  value === undefined || value === null || value === '' ? '--' : String(value);

/** 接口时间统一转换为页面格式；非法时间保留原值，便于定位数据问题。 */
export const renderMessageDateTime = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '--';
  const date = dayjs(String(value));
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : String(value);
};

/** 报文收发时间只展示日期；非法时间保留原值，便于定位数据问题。 */
export const renderMessageDate = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '--';
  const date = dayjs(String(value));
  return date.isValid() ? date.format('YYYY-MM-DD') : String(value);
};

/** 金额统一保留两位小数并使用英文千分位格式。 */
export const renderMessageAmount = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '--';
  const amount = Number(value);
  return Number.isFinite(amount) ? AMOUNT_FORMATTER.format(amount) : String(value);
};

/** 报文标识号 */
export const msgId: TableColumnType<MessageRecord> = {
  title: 'Message ID',
  dataIndex: 'msgId',
  width: 210,
};

/** 收发标志 */
export const msgDirection: TableColumnType<MessageRecord> = {
  title: 'Direction',
  dataIndex: 'msgDirection',
  width: 100,
  render: (value: MessageDirection) => MESSAGE_DIRECTION_LABELS[value] ?? renderMessageText(value),
};

/** 业务类型 */
export const businessType: TableColumnType<MessageRecord> = {
  title: 'Business Type',
  dataIndex: 'businessType',
  width: 110,
  render: (value: BusinessType) => BUSINESS_TYPE_LABELS[value] ?? renderMessageText(value),
};

/** 收发报通道 */
export const msgChannel: TableColumnType<MessageRecord> = {
  title: 'Channel',
  dataIndex: 'msgChannel',
  width: 140,
  render: renderMessageText,
};

/** 报文类型编码 */
export const msgType: TableColumnType<MessageRecord> = {
  title: 'Message Type',
  dataIndex: 'msgType',
  width: 180,
  render: renderMessageText,
};

/** 交易流水号 */
export const msgBusinessNo: TableColumnType<MessageRecord> = {
  title: 'Transaction No.',
  dataIndex: 'msgBusinessNo',
  width: 180,
  render: renderMessageText,
};

/** 金额 */
export const amount: TableColumnType<MessageRecord> = {
  title: 'Amount',
  dataIndex: 'amount',
  width: 140,
  align: 'right',
  render: renderMessageAmount,
};

/** 币种 */
export const currency: TableColumnType<MessageRecord> = {
  title: 'Currency',
  dataIndex: 'currency',
  width: 100,
  render: renderMessageText,
};

/** 外部交易参考号 */
export const refTxn20: TableColumnType<MessageRecord> = {
  title: 'refTxn20',
  dataIndex: 'refTxn20',
  width: 180,
  render: renderMessageText,
};

/** 本方参考号 */
export const ourReference: TableColumnType<MessageRecord> = {
  title: 'OurReference',
  dataIndex: 'ourReference',
  width: 180,
  render: renderMessageText,
};

/** 主报文编号 */
export const mainMsgId: TableColumnType<MessageRecord> = {
  title: 'Main Message ID',
  dataIndex: 'mainMsgId',
  width: 180,
  render: renderMessageText,
};

/** 关联流水号 */
export const msgRelatedId: TableColumnType<MessageRecord> = {
  title: 'Related Transaction No.',
  dataIndex: 'msgRelatedId',
  width: 180,
  render: renderMessageText,
};

/** 端到端流水号 */
export const msgEndId: TableColumnType<MessageRecord> = {
  title: 'End-to-End ID',
  dataIndex: 'msgEndId',
  width: 190,
  render: renderMessageText,
};

/** UETR 唯一标识号 */
export const msgUetr: TableColumnType<MessageRecord> = {
  title: 'UETR',
  dataIndex: 'msgUetr',
  width: 280,
  render: renderMessageText,
};

/** 发报机构 */
export const msgSendInst: TableColumnType<MessageRecord> = {
  title: 'Sending Institution',
  dataIndex: 'msgSendInst',
  width: 140,
  render: renderMessageText,
};

/** 收报机构 */
export const msgRecvInst: TableColumnType<MessageRecord> = {
  title: 'Receiving Institution',
  dataIndex: 'msgRecvInst',
  width: 140,
  render: renderMessageText,
};

/** 报文状态 */
export const transmissionStatus: TableColumnType<MessageRecord> = {
  title: 'Message Status',
  dataIndex: 'transmissionStatus',
  width: 110,
  render: (value: TransmissionStatus) => TRANSMISSION_STATUS_LABELS[value] ?? renderMessageText(value),
};

/** 收发报文日期 */
export const messageTime: TableColumnType<MessageRecord> = {
  title: 'Received/Sent Date',
  dataIndex: 'messageTime',
  width: 150,
  sorter: true,
  render: renderMessageDate,
};

/** 记录创建时间 */
export const createTime: TableColumnType<MessageRecord> = {
  title: 'Created At',
  dataIndex: 'createTime',
  width: 180,
  sorter: true,
  render: renderMessageDateTime,
};

/** 记录更新时间 */
export const updateTime: TableColumnType<MessageRecord> = {
  title: 'Updated At',
  dataIndex: 'updateTime',
  width: 180,
  sorter: true,
  render: renderMessageDateTime,
};

/** 备注 */
export const remark: TableColumnType<MessageRecord> = {
  title: 'Remarks',
  dataIndex: 'remark',
  width: 200,
  render: renderMessageText,
};
