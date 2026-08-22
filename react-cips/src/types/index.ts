import type { BusinessStatus, BusinessType, MessageDirection, Role, TransmissionStatus } from './enums';

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
  /** BUSINESS_TYPE：业务类型。 */
  businessType: BusinessType;
  /** MSG_RECV_DATE：收报日期。 */
  msgRecvDate: NullableText;
  /** MAIN_MSG_ID：主报文编号。 */
  mainMsgId: NullableText;
  /** MSG_CHANNEL：收报渠道。 */
  msgChannel: NullableText;
  /** MSG_TYPE：包含版本号的报文类型编码，同时作为 Formily Schema 注册键。 */
  msgType: string;
  /** MSG_BUSINESS_NO：交易流水号。 */
  msgBusinessNo: NullableText;
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
  /** 后端归一化后的报文时间，入站取收报时间，出站取发报时间。 */
  messageTime: string;
  /** 收发状态。 */
  transmissionStatus: TransmissionStatus;
  /** 业务状态。 */
  businessStatus: BusinessStatus;
}

export interface MessageProcessingRecord {
  recordId: string;
  processTime: string;
  node: string;
  status: string;
  resultSummary: string;
  operator: NullableText;
}

/** 报文明细；结构化字段值由后端解析，Schema 由前端静态维护。 */
export interface MessageDetail extends MessageRecord {
  formData: Record<string, unknown>;
}

export interface MessageRaw {
  content: string;
  contentType: string;
  fileName: string;
}
