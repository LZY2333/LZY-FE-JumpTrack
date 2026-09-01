import type { MessageBusinessType, MessageDirection, MsgRecvStatus, Role } from './enums';

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

/** 列表和详情共用的报文基本信息。 */
export interface MessageRecord {
  /** MSG_ID：系统内部主键，同时作为用户可见的报文标识号。 */
  msgId: string;
  /** MSG_DIRECTION：报文收发标志。 */
  msgDirection: MessageDirection;
  /** MSG_RECV_DATE：收报日期。 */
  msgRecvDate: NullableText;
  /** MSG_SEND_DATE：发报日期。 */
  msgSendDate: NullableText;
  /** MAIN_MSG_ID：主报文编号。 */
  mainMsgId: NullableText;
  /** MSG_CHANNEL：收/发报通道。 */
  msgChannel: NullableText;
  /** MSG_TYPE：包含版本号的报文类型编码，同时作为 Formily Schema 注册键。 */
  msgType: string;
  /** MSG_BUS_TYPE：不含版本号的报文业务类型编码。 */
  msgBusType: string;
  /** MSG_BUSINESS_NO：交易流水号。 */
  msgBusinessNo: NullableText;
  /** REMIT_AMOUNT：支付类报文汇付金额。 */
  remitAmount: NullableText;
  /** REMIT_CCY：支付类报文汇付币种。 */
  remitCcy: NullableText;
  /** TRAN_ID：支付类报文交易标识号，列表显示名沿用 refTxn20。 */
  tranId: NullableText;
  /** REF_NO：收发任务交易编号，列表显示名沿用 OurReference。 */
  refNo: NullableText;
  /** MSG_OWNER_DEPT：收报归属部门，列表显示名沿用 Clearing Target Department。 */
  msgOwnerDept: NullableText;
  /** MSG_OWNER_GROUP：收报归属组。 */
  msgOwnerGroup: NullableText;
  /** STP_IND：直通标记。 */
  stpInd: NullableText;
  /** NON_STP_CODE：非直通原因编号。 */
  nonStpCode: NullableText;
  /** NON_STP_REASON：非直通异常原因说明。 */
  nonStpReason: NullableText;
  /** MSG_RELATED_ID：关联流水号。 */
  msgRelatedId: NullableText;
  /** MSG_END_ID：报文端到端流水号。 */
  msgEndId: NullableText;
  /** MSG_UETR：UETR 唯一标识号。 */
  msgUetr: NullableText;
  /** MSG_SEND_TIME：报文发出时间。 */
  msgSendTime: NullableText;
  /** MSG_SEND_INST：发报机构编号。 */
  msgSendInst: NullableText;
  /** MSG_RECV_INST：收报机构编号。 */
  msgRecvInst: NullableText;
  /** MSG_RECV_STATUS：收报状态。 */
  msgRecvStatus: MsgRecvStatus | null;
  /** MSG_SEND_STATUS：发报状态。 */
  msgSendStatus: NullableText;
  /** REMARK：备注。 */
  remark: NullableText;
  /** CREATE_USER：创建人。 */
  createUser: NullableText;
  /** CREATE_BRNO：创建人部门号。 */
  createBrno: NullableText;
  /** AUTHOR_USER：审批人。 */
  authorUser: NullableText;
  /** AUTHOR_BRNO：审批人部门号。 */
  authorBrno: NullableText;
  /** CREATE_TIME：记录创建时间。 */
  createTime: string;
  /** UPDATE_TIME：记录更新时间。 */
  updateTime: string;
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
  /** BUSINESS_TYPE：仅供详情选择对应业务信息表，不直接向用户展示。 */
  businessType: MessageBusinessType;
  /** 类型信息表和属性表按表关系组合后的业务数据。 */
  formData: Record<string, unknown>;
}

export interface MessageRaw {
  content: string;
  contentType: string;
  fileName: string;
}
