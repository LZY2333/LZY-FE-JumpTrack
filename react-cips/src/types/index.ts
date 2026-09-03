import type { MessageBusinessType, MessageDirection, MsgRecvStatus, MsgSendStatus, Role } from './enums';

export interface UserIdentity {
  /** 用户 ID */
  userId: string;
  /** 机构 ID */
  orgId: string;
  /** 用户名 */
  userName: string;
}

export interface User extends UserIdentity {
  /** 用户角色列表 */
  roles: Role[];
}

export type NullableText = string | null;

/** 列表和详情共用的报文基本信息，前半部分按默认表格列顺序声明。 */
export interface MessageRecord {
  /** 报文标识号：MSG_ID。 */
  msgId: string;
  /** 收发方向：MSG_DIRECTION。 */
  msgDirection: MessageDirection;
  /** 业务类型：BUSINESS_TYPE；尚未完成分类时为 null，不等同于 OTHER。 */
  businessType: MessageBusinessType | null;
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

/** PSSST_LOG_AUDIT_TRAIL：报文处理历史审计轨迹。 */
export interface MessageAuditTrailRecord {
  /** LOG_ID：日志主键。 */
  logId: string;
  /** REF_NO：关联报文 MSG_ID 的业务参考号。 */
  refNo: string;
  /** TASK_ID：可选关联 PSSST_TRN_TASK_INFO 的任务编号。 */
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

/** 报文明细；结构化字段值由后端解析，Schema 由前端静态维护。 */
export interface MessageDetail extends MessageRecord {
  /** 类型信息表和属性表按表关系组合后的业务数据。 */
  formData: Record<string, unknown>;
}

export interface MessageRaw {
  content: string;
  contentType: string;
  fileName: string;
}
