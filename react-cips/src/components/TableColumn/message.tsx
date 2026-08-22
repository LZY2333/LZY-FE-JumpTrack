import { Tag } from 'antd';
import type { TableColumnType } from 'antd';
import dayjs from 'dayjs';
import type { MessageRecord } from '@/types';
import {
  BUSINESS_STATUS_LABELS,
  BUSINESS_TYPE_LABELS,
  BusinessStatus,
  BusinessType,
  MESSAGE_DIRECTION_LABELS,
  MessageDirection,
  TRANSMISSION_STATUS_LABELS,
  TransmissionStatus,
} from '@/types/enums';

// 状态色在列表与详情页共用，避免同一状态出现不同视觉语义。
const TRANSMISSION_STATUS_COLORS: Record<TransmissionStatus, string> = {
  [TransmissionStatus.Pending]: 'default',
  [TransmissionStatus.Processing]: 'processing',
  [TransmissionStatus.Success]: 'success',
  [TransmissionStatus.Failed]: 'error',
};

const BUSINESS_STATUS_COLORS: Record<BusinessStatus, string> = {
  [BusinessStatus.Pending]: 'default',
  [BusinessStatus.Accepted]: 'processing',
  [BusinessStatus.Settled]: 'success',
  [BusinessStatus.Rejected]: 'error',
  [BusinessStatus.Cancelled]: 'warning',
};

/** 表格空值统一展示为 --，但不修改数据本身。 */
export const renderMessageText = (value: unknown) =>
  value === undefined || value === null || value === '' ? '--' : String(value);

/** 接口时间统一转换为页面格式；非法时间保留原值，便于定位数据问题。 */
export const renderMessageDateTime = (value: unknown) => {
  if (value === undefined || value === null || value === '') return '--';
  const date = dayjs(String(value));
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : String(value);
};

export const getTransmissionStatusColor = (value: TransmissionStatus) =>
  TRANSMISSION_STATUS_COLORS[value] ?? 'default';

export const getBusinessStatusColor = (value: BusinessStatus) =>
  BUSINESS_STATUS_COLORS[value] ?? 'default';

export const msgId: TableColumnType<MessageRecord> = {
  title: '报文标识号',
  dataIndex: 'msgId',
  width: 210,
};

export const msgDirection: TableColumnType<MessageRecord> = {
  title: '收发标志',
  dataIndex: 'msgDirection',
  width: 100,
  render: (value: MessageDirection) => MESSAGE_DIRECTION_LABELS[value] ?? renderMessageText(value),
};

export const businessType: TableColumnType<MessageRecord> = {
  title: '业务类型',
  dataIndex: 'businessType',
  width: 110,
  render: (value: BusinessType) => BUSINESS_TYPE_LABELS[value] ?? renderMessageText(value),
};

export const msgChannel: TableColumnType<MessageRecord> = {
  title: '收报渠道',
  dataIndex: 'msgChannel',
  width: 120,
  render: renderMessageText,
};

export const msgType: TableColumnType<MessageRecord> = {
  title: '报文类型编码',
  dataIndex: 'msgType',
  width: 180,
  render: renderMessageText,
};

export const msgBusinessNo: TableColumnType<MessageRecord> = {
  title: '交易流水号',
  dataIndex: 'msgBusinessNo',
  width: 180,
  render: renderMessageText,
};

export const mainMsgId: TableColumnType<MessageRecord> = {
  title: '主报文编号',
  dataIndex: 'mainMsgId',
  width: 180,
  render: renderMessageText,
};

export const msgRelatedId: TableColumnType<MessageRecord> = {
  title: '关联流水号',
  dataIndex: 'msgRelatedId',
  width: 180,
  render: renderMessageText,
};

export const msgEndId: TableColumnType<MessageRecord> = {
  title: '端到端流水号',
  dataIndex: 'msgEndId',
  width: 190,
  render: renderMessageText,
};

export const msgUetr: TableColumnType<MessageRecord> = {
  title: 'UETR',
  dataIndex: 'msgUetr',
  width: 280,
  render: renderMessageText,
};

export const msgSendInst: TableColumnType<MessageRecord> = {
  title: '发报机构',
  dataIndex: 'msgSendInst',
  width: 140,
  render: renderMessageText,
};

export const msgRecvInst: TableColumnType<MessageRecord> = {
  title: '收报机构',
  dataIndex: 'msgRecvInst',
  width: 140,
  render: renderMessageText,
};

export const transmissionStatus: TableColumnType<MessageRecord> = {
  title: '收发状态',
  dataIndex: 'transmissionStatus',
  width: 110,
  render: (value: TransmissionStatus) => (
    <Tag className='mr-0' color={getTransmissionStatusColor(value)}>
      {TRANSMISSION_STATUS_LABELS[value] ?? renderMessageText(value)}
    </Tag>
  ),
};

export const businessStatus: TableColumnType<MessageRecord> = {
  title: '业务状态',
  dataIndex: 'businessStatus',
  width: 110,
  render: (value: BusinessStatus) => (
    <Tag className='mr-0' color={getBusinessStatusColor(value)}>
      {BUSINESS_STATUS_LABELS[value] ?? renderMessageText(value)}
    </Tag>
  ),
};

// 一期只允许统一报文时间、创建时间、更新时间触发服务端排序。
export const messageTime: TableColumnType<MessageRecord> = {
  title: '统一报文时间',
  dataIndex: 'messageTime',
  width: 180,
  sorter: true,
  render: renderMessageDateTime,
};

export const createTime: TableColumnType<MessageRecord> = {
  title: '记录创建时间',
  dataIndex: 'createTime',
  width: 180,
  sorter: true,
  render: renderMessageDateTime,
};

export const updateTime: TableColumnType<MessageRecord> = {
  title: '记录更新时间',
  dataIndex: 'updateTime',
  width: 180,
  sorter: true,
  render: renderMessageDateTime,
};

export const remark: TableColumnType<MessageRecord> = {
  title: '备注',
  dataIndex: 'remark',
  width: 200,
  render: renderMessageText,
};
