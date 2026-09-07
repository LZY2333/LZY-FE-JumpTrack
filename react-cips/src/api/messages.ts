import type { Pagination } from './request';
import { get, post } from './request';
import type { MessageAuditTrailRecord, MessageDetail, MessageRaw, MessageRecord } from '@/types';
import type {
  MessageChannel,
  MessageBusinessType,
  MessageDirection,
  MsgRecvStatus,
  MsgSendStatus,
  QuerySortOrder,
} from '@/types/enums';

const MESSAGE_API = '/api/example/v1/messages';

/** 报文列表允许用户触发的服务端排序字段。 */
export type MessageSortField = 'msgDate' | 'createTime' | 'updateTime';

/** 报文查询条件，按页面从左到右、从上到下的字段顺序声明。 */
export interface MessageQueryConditions {
  /** 收发方向：MSG_DIRECTION。 */
  msgDirection: MessageDirection;
  /** 业务类型：BUSINESS_TYPE；交易标识、金额或币种有值时必填。 */
  businessType?: MessageBusinessType;
  /** 收报状态：MSG_RECV_STATUS，仅在 IN 时提交。 */
  msgRecvStatus?: MsgRecvStatus;
  /** 发报状态：MSG_SEND_STATUS，仅在 OU 时提交；临时枚举待后端确认。 */
  msgSendStatus?: MsgSendStatus;
  /** 收发日期起点：IN.MSG_RECV_DATE / OU.MSG_SEND_DATE，由必填方向确定主表。 */
  msgDateFrom?: string;
  /** 收发日期终点：IN.MSG_RECV_DATE / OU.MSG_SEND_DATE，包含边界。 */
  msgDateTo?: string;
  /** 报文类型：MSG_TYPE。 */
  msgType?: string;
  /** 业务流水号：MSG_BUSINESS_NO。 */
  msgBusinessNo?: string;
  /** 报文标识号：MSG_ID。 */
  msgId?: string;
  /** 交易标识号：TRAN_ID。 */
  tranId?: string;
  /** 币种：REMIT_CCY / BILL_CCY / GPI_CCY，按业务类型确定来源。 */
  currency?: string;
  /** 金额下限：REMIT_AMOUNT / GPI_AMOUNT / NETTING_AMOUNT，后端按业务类型映射。 */
  amountFrom?: number;
  /** 金额上限：REMIT_AMOUNT / GPI_AMOUNT / NETTING_AMOUNT。 */
  amountTo?: number;
  /** 收发报通道：MSG_CHANNEL。 */
  channel?: MessageChannel[];
  /** 报文归属部门：MSG_OWNER_DEPT。 */
  msgOwnerDept?: string;
  /** 报文归属组：MSG_OWNER_GROUP。 */
  msgOwnerGroup?: string;
  /** 主报文编号：MAIN_MSG_ID。 */
  mainMsgId?: string;
  /** 关联流水号：MSG_RELATED_ID。 */
  msgRelatedId?: string;
  /** 端到端流水号：MSG_END_ID。 */
  msgEndId?: string;
  /** UETR 唯一标识号：MSG_UETR。 */
  msgUetr?: string;
  /** 服务端排序字段。 */
  sortField?: MessageSortField;
  /** 服务端排序方向。 */
  sortOrder?: QuerySortOrder;
}

/** 带分页的报文查询请求。 */
export interface MessageQuery extends MessageQueryConditions {
  /** 当前页码。 */
  current: number;
  /** 每页记录数。 */
  pageSize: number;
}

/** 报文分页查询结果。 */
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
