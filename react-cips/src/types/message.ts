import type { MessageBusinessType, MessageDirection, MsgRecvStatus, MsgSendStatus } from './enums';
import type { NullableText } from './index';

/** 列表和详情共用的报文基本信息，前半部分按默认表格列顺序声明。 */
export interface MessageRecord {
  /** 报文标识号：MSG_ID。 */
  msgId: string;
  /** 收发方向：MSG_DIRECTION。 */
  msgDirection: MessageDirection;
  /** 业务类型：BUSINESS_TYPE。 */
  businessType: MessageBusinessType;
  /** 收发报通道：MSG_CHANNEL。 */
  msgChannel: NullableText;
  /** 报文类型：MSG_TYPE。 */
  msgType: string;
  /** 业务流水号：MSG_BUSINESS_NO。 */
  msgBusinessNo: NullableText;
  /** 金额：REMIT_AMOUNT / GPI_AMOUNT / NETTING_AMOUNT。 */
  amount: NullableText;
  /** 币种：REMIT_CCY / GPI_CCY / BILL_CCY。 */
  currency: NullableText;
  /** 交易标识号：TRAN_ID。 */
  tranId: NullableText;
  /** 收报状态：MSG_RECV_STATUS。 */
  msgRecvStatus: MsgRecvStatus | null;
  /** 发报状态：MSG_SEND_STATUS。 */
  msgSendStatus: MsgSendStatus | null;
  /** 收发日期：IN.MSG_RECV_DATE / OU.MSG_SEND_DATE。 */
  msgDate: NullableText;
  /** UETR 唯一标识号：MSG_UETR。 */
  msgUetr: NullableText;
  /** 报文归属部门：MSG_OWNER_DEPT。 */
  msgOwnerDept: NullableText;
  /** 报文归属组：MSG_OWNER_GROUP。 */
  msgOwnerGroup: NullableText;
  /** 发报来源系统：OU.FROM_SYSTEM。 */
  fromSystem: NullableText;
  /** 主报文编号：MAIN_MSG_ID。 */
  mainMsgId: NullableText;
  /** 关联流水号：MSG_RELATED_ID。 */
  msgRelatedId: NullableText;
  /** 端到端流水号：MSG_END_ID。 */
  msgEndId: NullableText;
  /** 记录创建时间：CREATE_TIME。 */
  createTime: string;
  /** 记录更新时间：UPDATE_TIME。 */
  updateTime: string;
  /** 备注：REMARK。 */
  remark: NullableText;
  /** 报文发出时间：MSG_SEND_TIME，报文原文中记录的发送时间。 */
  msgSendTime: NullableText;
  /** 非直通异常原因说明：NON_STP_REASON。 */
  nonStpReason: NullableText;
  /** 创建人：CREATE_USER。 */
  createUser: NullableText;
  /** 创建人部门号：CREATE_BRNO。 */
  createBrno: NullableText;
  /** 审批人：AUTHOR_USER。 */
  authorUser: NullableText;
  /** 审批人部门号：AUTHOR_BRNO。 */
  authorBrno: NullableText;
}

/** 报文处理历史审计轨迹。 */
export interface MessageAuditTrailRecord {
  /** LOG_ID：日志主键。 */
  logId: string;
  /** REF_NO：关联报文 MSG_ID 的业务参考号。 */
  refNo: string;
  /** TASK_ID：可选关联 Task表 的任务编号。 */
  taskId: NullableText;
  /** SERVICE_MODULE：产生事件的服务模块编号。 */
  serviceModule: string;
  /** EVENT_CODE：事件编号。 */
  eventCode: string;
  /** EVENT_DETAIL：事件详细内容。 */
  eventDetail: string;
  /** REMARK：事件备注。 */
  remark: NullableText;
  /** EVENT_USER：事件关联用户。 */
  eventUser: string;
  /** EVENT_TIME：事件实际发生时间。 */
  eventTime: string;
  /** CREATE_TIME：日志记录创建时间。 */
  createTime: string;
}

/** 单条实体表记录；字段结构由前端静态 Schema 约束。 */
export type MessageEntityRecord = Record<string, unknown>;

/** 报文明细；基础信息和各实体表记录在响应 body 中保持同级。 */
export interface MessageDetail {
  /** PSSST_ENT_BASIC_INFO：报文基础信息。 */
  msgBasicInfo: MessageRecord;
  /** PSSST_ENT_PAY_INFO：支付类报文详情，非支付类为 null。 */
  paymentInfo: MessageEntityRecord | null;
  /** PSSST_ENT_PAY_PARTY：支付交易对象，一条支付信息可对应多条记录。 */
  paymentParties: MessageEntityRecord[];
  /** PSSST_ENT_BILL_INFO：账单类报文信息，非账单类为 null。 */
  billInfo: MessageEntityRecord | null;
  /** PSSST_ENT_BILL_DETAIL：账单详情，与 billInfo 一对一，非账单类为 null。 */
  billDetails: MessageEntityRecord | null;
  /** PSSST_ENT_QUERY_INFO：查询查复详情，非查询类为 null。 */
  queryInfo: MessageEntityRecord | null;
  /** PSSST_ENT_QUERY_GPI：GPI 属性，与 queryInfo 一对一；无 GPI 数据时为 null。 */
  queryGpi: MessageEntityRecord | null;
}

export interface MessageRaw {
  content: string;
  contentType: string;
  fileName: string;
}
