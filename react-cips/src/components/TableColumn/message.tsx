import type { TableColumnType } from 'antd';
import dayjs from 'dayjs';
import type { MessageRecord } from '@/types';
import {
  MESSAGE_DIRECTION_LABELS,
  MSG_RECV_STATUS_LABELS,
  MessageDirection,
  MsgRecvStatus,
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
  title: 'Business No.',
  dataIndex: 'msgBusinessNo',
  width: 180,
  render: renderMessageText,
};

/** 支付类报文汇付金额 */
export const remitAmount: TableColumnType<MessageRecord> = {
  title: 'Remittance Amount',
  dataIndex: 'remitAmount',
  width: 140,
  align: 'right',
  render: renderMessageAmount,
};

/** 支付类报文汇付币种 */
export const remitCcy: TableColumnType<MessageRecord> = {
  title: 'Remittance Currency',
  dataIndex: 'remitCcy',
  width: 150,
  render: renderMessageText,
};

/** TRAN_ID：显示名沿用 refTxn20 */
export const tranId: TableColumnType<MessageRecord> = {
  title: 'refTxn20',
  dataIndex: 'tranId',
  width: 180,
  render: renderMessageText,
};

/** REF_NO：显示名沿用 OurReference */
export const refNo: TableColumnType<MessageRecord> = {
  title: 'OurReference',
  dataIndex: 'refNo',
  width: 180,
  render: renderMessageText,
};

/** MSG_OWNER_DEPT：显示名沿用 Clearing Target Department */
export const msgOwnerDept: TableColumnType<MessageRecord> = {
  title: 'Clearing Target Department',
  dataIndex: 'msgOwnerDept',
  width: 210,
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
  title: 'Related Message ID',
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

/** 收报状态 */
export const msgRecvStatus: TableColumnType<MessageRecord> = {
  title: 'Received Status',
  dataIndex: 'msgRecvStatus',
  width: 130,
  render: (value: MsgRecvStatus) => MSG_RECV_STATUS_LABELS[value] ?? renderMessageText(value),
};

/** 发报状态 */
export const msgSendStatus: TableColumnType<MessageRecord> = {
  title: 'Sent Status',
  dataIndex: 'msgSendStatus',
  width: 130,
  render: renderMessageText,
};

/** 收报日期 */
export const msgRecvDate: TableColumnType<MessageRecord> = {
  title: 'Received Date',
  dataIndex: 'msgRecvDate',
  width: 150,
  sorter: true,
  render: renderMessageDate,
};

/** 发报日期 */
export const msgSendDate: TableColumnType<MessageRecord> = {
  title: 'Sent Date',
  dataIndex: 'msgSendDate',
  width: 150,
  sorter: true,
  render: renderMessageDate,
};

/** 记录创建时间 */
export const createTime: TableColumnType<MessageRecord> = {
  title: 'Created Time',
  dataIndex: 'createTime',
  width: 180,
  sorter: true,
  render: renderMessageDateTime,
};

/** 记录更新时间 */
export const updateTime: TableColumnType<MessageRecord> = {
  title: 'Updated Time',
  dataIndex: 'updateTime',
  width: 180,
  sorter: true,
  render: renderMessageDateTime,
};

/** 备注 */
export const remark: TableColumnType<MessageRecord> = {
  title: 'Remark',
  dataIndex: 'remark',
  width: 200,
  render: renderMessageText,
};
