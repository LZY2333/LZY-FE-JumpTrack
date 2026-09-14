import type { TableColumnType } from 'antd';
import type { MessageRecord } from '@/types';
import type { LcwRecord } from '@/api/lcw';
import {
  LCW_INITIAL_STATUS_LABELS,
  MESSAGE_DIRECTION_LABELS,
  MESSAGE_BUSINESS_TYPE_LABELS,
  MSG_RECV_STATUS_LABELS,
  MSG_SEND_STATUS_LABELS,
  LcwInitialStatus,
  MessageDirection,
  MessageBusinessType,
  MsgRecvStatus,
  MsgSendStatus,
} from '@/types/enums';
import { renderMessageAmount, renderMessageDate, renderMessageDateTime, renderMessageText } from './messageColumnUtil';

// 字段顺序与报文列表的默认列顺序一致。

/** 报文标识号：MSG_ID */
export const msgId = {
  title: 'Message ID',
  dataIndex: 'msgId',
  width: 210,
  render: renderMessageText,
};

/** 收发方向：MSG_DIRECTION */
export const msgDirection = {
  title: 'Direction',
  dataIndex: 'msgDirection',
  width: 100,
  render: (value: MessageDirection) => MESSAGE_DIRECTION_LABELS[value] ?? renderMessageText(value),
};

/** 业务类型：BUSINESS_TYPE */
export const businessType: TableColumnType<MessageRecord> = {
  title: 'Business Type',
  dataIndex: 'businessType',
  width: 160,
  render: (value: MessageBusinessType) => MESSAGE_BUSINESS_TYPE_LABELS[value] ?? renderMessageText(value),
};

/** 收发报通道：MSG_CHANNEL */
export const msgChannel = {
  title: 'Channel',
  dataIndex: 'msgChannel',
  width: 140,
  render: renderMessageText,
};

/** 报文类型：MSG_TYPE */
export const msgType: TableColumnType<MessageRecord> = {
  title: 'Message Type',
  dataIndex: 'msgType',
  width: 180,
  render: renderMessageText,
};

/** 业务流水号：MSG_BUSINESS_NO */
export const msgBusinessNo: TableColumnType<MessageRecord> = {
  title: 'Business No.',
  dataIndex: 'msgBusinessNo',
  width: 180,
  render: renderMessageText,
};

/** 金额：REMIT_AMOUNT / GPI_AMOUNT / NETTING_AMOUNT */
export const amount: TableColumnType<MessageRecord> = {
  title: 'Amount',
  dataIndex: 'amount',
  width: 140,
  align: 'right',
  render: renderMessageAmount,
};

/** 币种：REMIT_CCY / GPI_CCY / BILL_CCY */
export const currency: TableColumnType<MessageRecord> = {
  title: 'Currency',
  dataIndex: 'currency',
  width: 150,
  render: renderMessageText,
};

/** 交易标识号：TRAN_ID */
export const tranId: TableColumnType<MessageRecord> = {
  title: 'refTxn20',
  dataIndex: 'tranId',
  width: 180,
  render: renderMessageText,
};

/** 收报状态：MSG_RECV_STATUS */
export const msgRecvStatus: TableColumnType<MessageRecord> = {
  title: 'Received Status',
  dataIndex: 'msgRecvStatus',
  width: 130,
  render: (value: MsgRecvStatus) => MSG_RECV_STATUS_LABELS[value] ?? renderMessageText(value),
};

/** 发报状态：MSG_SEND_STATUS */
export const msgSendStatus: TableColumnType<MessageRecord> = {
  title: 'Sent Status',
  dataIndex: 'msgSendStatus',
  width: 130,
  render: (value: MsgSendStatus) => MSG_SEND_STATUS_LABELS[value] ?? renderMessageText(value),
};

/** 收发日期：IN.MSG_RECV_DATE / OU.MSG_SEND_DATE */
export const msgDate = {
  title: 'Message Date',
  dataIndex: 'msgDate',
  width: 150,
  sorter: true,
  render: renderMessageDate,
};

/** UETR 唯一标识号：MSG_UETR */
export const msgUetr: TableColumnType<MessageRecord> = {
  title: 'UETR',
  dataIndex: 'msgUetr',
  width: 280,
  render: renderMessageText,
};

/** 报文归属部门：MSG_OWNER_DEPT */
export const msgOwnerDept: TableColumnType<MessageRecord> = {
  title: 'Owner Department',
  dataIndex: 'msgOwnerDept',
  width: 180,
  render: renderMessageText,
};

/** 报文归属组：MSG_OWNER_GROUP */
export const msgOwnerGroup: TableColumnType<MessageRecord> = {
  title: 'Owner Group',
  dataIndex: 'msgOwnerGroup',
  width: 150,
  render: renderMessageText,
};

/** 主报文编号：MAIN_MSG_ID */
export const mainMsgId: TableColumnType<MessageRecord> = {
  title: 'Main Message ID',
  dataIndex: 'mainMsgId',
  width: 180,
  render: renderMessageText,
};

/** 关联流水号：MSG_RELATED_ID */
export const msgRelatedId: TableColumnType<MessageRecord> = {
  title: 'Related Message ID',
  dataIndex: 'msgRelatedId',
  width: 180,
  render: renderMessageText,
};

/** 端到端流水号：MSG_END_ID */
export const msgEndId: TableColumnType<MessageRecord> = {
  title: 'End-to-End ID',
  dataIndex: 'msgEndId',
  width: 190,
  render: renderMessageText,
};

/** 记录创建时间：CREATE_TIME */
export const createTime: TableColumnType<MessageRecord> = {
  title: 'Created Time',
  dataIndex: 'createTime',
  width: 180,
  sorter: true,
  render: renderMessageDateTime,
};

/** 记录更新时间：UPDATE_TIME */
export const updateTime: TableColumnType<MessageRecord> = {
  title: 'Updated Time',
  dataIndex: 'updateTime',
  width: 180,
  sorter: true,
  render: renderMessageDateTime,
};

/** 备注：REMARK */
export const remark: TableColumnType<MessageRecord> = {
  title: 'Remark',
  dataIndex: 'remark',
  width: 200,
  render: renderMessageText,
};

/* =================== LCW 任务专用 TableColumn =================== */

/** LCW 初次判定状态：LCW_INITIAL_STATUS */
export const lcwInitialStatus = {
  title: 'LCW Status',
  dataIndex: 'lcwInitialStatus',
  width: 210,
  render: (value: LcwInitialStatus) => LCW_INITIAL_STATUS_LABELS[value] ?? renderMessageText(value),
};

/** LCW 接口失败信息：RES_CODE / RES_MESSAGE */
export const lcwFailureInfo = {
  title: 'LCW Failure Info',
  key: 'lcwFailureInfo',
  width: 320,
  ellipsis: { showTitle: false },
  render: (_: unknown, record: LcwRecord) =>
    `${renderMessageText(record.resCode)} : ${renderMessageText(record.resMessage)}`,
};

/** LCW 初次判定完成时间：LCW_INITIAL_TIME */
export const lcwInitialTime = {
  title: 'Exception Time',
  dataIndex: 'lcwInitialTime',
  width: 180,
  render: renderMessageDateTime,
};

/* ================= LCW 任务专用 TableColumn 结束 ================= */
