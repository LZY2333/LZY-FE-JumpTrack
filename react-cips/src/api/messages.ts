import type { Pagination } from './request';
import { get, post } from './request';
import type { MessageAuditTrailRecord, MessageDetail, MessageRaw, MessageRecord } from '@/types';
import type { MessageDirection, MessageSortField, MsgRecvStatus } from '@/types/enums';

const MESSAGE_API = '/api/example/v1/messages';

export type MessageQuerySortOrder = 'asc' | 'desc';

export interface MessageQueryConditions {
  /** MSG_ID：报文标识号。 */
  msgId?: string;
  /** MSG_BUSINESS_NO：业务流水号。 */
  msgBusinessNo?: string;
  /** MSG_TYPE：报文类型编码。 */
  msgType?: string;
  /** MSG_BUS_TYPE：报文业务类型编码。 */
  msgBusType?: string;
  /** MSG_DIRECTION：报文收发标志。 */
  msgDirection?: MessageDirection;
  /** MSG_RECV_STATUS：收报状态。 */
  msgRecvStatus?: MsgRecvStatus;
  /** MSG_SEND_STATUS：发报状态。 */
  msgSendStatus?: string;
  /** MSG_RECV_DATE：收报日期范围起点。 */
  msgRecvDateFrom?: string;
  /** MSG_RECV_DATE：收报日期范围终点。 */
  msgRecvDateTo?: string;
  /** MSG_SEND_DATE：发报日期范围起点。 */
  msgSendDateFrom?: string;
  /** MSG_SEND_DATE：发报日期范围终点。 */
  msgSendDateTo?: string;
  /** MSG_CHANNEL：收发报通道。 */
  msgChannel?: string;
  /** MAIN_MSG_ID：主报文编号。 */
  mainMsgId?: string;
  /** MSG_RELATED_ID：关联流水号。 */
  msgRelatedId?: string;
  /** MSG_END_ID：端到端流水号。 */
  msgEndId?: string;
  /** MSG_UETR：UETR唯一标识号。 */
  msgUetr?: string;
  /** MSG_SEND_INST：发报机构编号。 */
  msgSendInst?: string;
  /** MSG_RECV_INST：收报机构编号。 */
  msgRecvInst?: string;
  /** REF_NO：收发任务交易编号。 */
  refNo?: string;
  /** TRAN_ID：支付类报文交易标识号。 */
  tranId?: string;
  /** 统一金额范围起点，由后端按 BUSINESS_TYPE 映射业务金额字段。 */
  amountFrom?: number;
  /** 统一金额范围终点，由后端按 BUSINESS_TYPE 映射业务金额字段。 */
  amountTo?: number;
  /** MSG_OWNER_DEPT：收报归属部门。 */
  msgOwnerDept?: string;
  /** MSG_OWNER_GROUP：收报归属组。 */
  msgOwnerGroup?: string;
  /** STP_IND：直通标记。 */
  stpInd?: string;
  /** NON_STP_CODE：非直通原因编号。 */
  nonStpCode?: string;
  /** 服务端排序字段。 */
  sortField?: MessageSortField;
  /** 服务端排序方向。 */
  sortOrder?: MessageQuerySortOrder;
}

export interface MessageQuery extends MessageQueryConditions {
  /** 当前页码。 */
  current: number;
  /** 每页记录数。 */
  pageSize: number;
}

export interface PagedMessages extends Pagination {
  /** 当前页报文列表。 */
  list: MessageRecord[];
}

/** 按筛选、分页和远程排序条件查询报文。 */
export const getMessages = (params: MessageQuery) => post<PagedMessages>(`${MESSAGE_API}/query`, params);

/** 查询指定报文的基本信息和结构化字段值。 */
export const getMessage = (msgId: string) => get<MessageDetail>(`${MESSAGE_API}/${encodeURIComponent(msgId)}`);

/** 异步加载原始报文文本，不阻塞基本明细。 */
export const getMessageRaw = (msgId: string) => get<MessageRaw>(`${MESSAGE_API}/${encodeURIComponent(msgId)}/raw`);

/** 异步加载指定报文的处理轨迹。 */
export const getMessageProcessingRecords = (msgId: string) =>
  get<MessageAuditTrailRecord[]>(`${MESSAGE_API}/${encodeURIComponent(msgId)}/processing-records`);

/** 异步加载与指定报文处于同一业务链路的关联报文。 */
export const getRelatedMessages = (msgId: string) =>
  get<MessageRecord[]>(`${MESSAGE_API}/${encodeURIComponent(msgId)}/related-messages`);
