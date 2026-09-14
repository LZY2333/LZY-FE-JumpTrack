import type { Pagination } from './request';
import { get, post } from './request';
import type { MessageAuditTrailRecord, MessageDetail, MessageRecord } from '@/types';
import type {
  MessageChannel,
  MessageBusinessType,
  MessageDirection,
  MsgRecvStatus,
  MsgSendStatus,
  QuerySortOrder,
} from '@/types/enums';

/** 报文接口基础 URL。 */
export const API_BASE_MESSAGE = '/cips/message';

/** 查询报文 list。 */
export const API_MESSAGE_QUERY = `${API_BASE_MESSAGE}/query`;
export const getMessages = (params: MessageQuery) => post<PagedMessages>(API_MESSAGE_QUERY, params);

/** 查询报文明细。 */
export const API_MESSAGE_DETAIL = `${API_BASE_MESSAGE}/detail/:msgDirection/:businessType/:msgId`;
export const getMessage = ({ msgId, msgDirection, businessType }: MessageDetailParams) =>
  get<MessageDetail>(
    API_MESSAGE_DETAIL.replace(':msgDirection', encodeURIComponent(msgDirection))
      .replace(':businessType', encodeURIComponent(businessType))
      .replace(':msgId', encodeURIComponent(msgId)),
  );

/** 查询报文原文。 */
export const API_MESSAGE_RAW = `${API_BASE_MESSAGE}/raw/:msgDirection/:msgId`;
export const getMessageRaw = ({ msgId, msgDirection }: MessageRawParams) =>
  get<MessageRaw>(
    API_MESSAGE_RAW.replace(':msgDirection', encodeURIComponent(msgDirection)).replace(
      ':msgId',
      encodeURIComponent(msgId),
    ),
  );

/** 查询报文处理轨迹。 */
export const API_MESSAGE_PROCESSING_RECORDS = `${API_BASE_MESSAGE}/processing-records/:msgId`;
export const getMessageProcessingRecords = (msgId: string) =>
  get<MessageAuditTrailRecord[]>(API_MESSAGE_PROCESSING_RECORDS.replace(':msgId', encodeURIComponent(msgId)));

/** 查询报文明细所需的完整定位信息。 */
export interface MessageDetailParams {
  /** 报文标识号。 */
  msgId: string;
  /** 收发方向，用于确定收报或发报主表。 */
  msgDirection: MessageDirection;
  /** 业务类型，用于确定结构化业务表。 */
  businessType: MessageBusinessType;
}

/** 查询报文原文所需的完整定位信息。 */
export interface MessageRawParams {
  /** 报文标识号。 */
  msgId: string;
  /** 收发方向，用于确定收报或发报主表。 */
  msgDirection: MessageDirection;
}

/** 报文原文。 */
export interface MessageRaw {
  /** 报文标识号：MSG_ID。 */
  msgId: string;
  /** 报文原文：MSG_CONTENT。 */
  msgContent: string;
  /** 创建时间：CREATE_TIME。 */
  createTime: string;
}

/** 报文列表允许用户触发的服务端排序字段。 */
export type MessageSortField = 'msgDate' | 'createTime' | 'updateTime';

/** 报文查询条件，按页面从左到右、从上到下的字段顺序声明。 */
export interface MessageQueryConditions {
  /** 收发方向：MSG_DIRECTION。 */
  msgDirection: MessageDirection;
  /** 业务类型：BUSINESS_TYPE；交易标识、金额或币种有值时必填。 */
  businessType?: MessageBusinessType;
  /** 收报状态：MSG_RECV_STATUS，仅在 IN 时提交。 */
  msgRecvStatus?: MsgRecvStatus[];
  /** 发报状态：MSG_SEND_STATUS，仅在 OU 时提交；临时枚举待后端确认。 */
  msgSendStatus?: MsgSendStatus[];
  /** 收发日期起点：IN.MSG_RECV_DATE / OU.MSG_SEND_DATE，格式为 YYYY-MM-DD。 */
  msgDateFrom?: string;
  /** 收发日期终点：IN.MSG_RECV_DATE / OU.MSG_SEND_DATE，格式为 YYYY-MM-DD。 */
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
  /** 发报来源系统：OU.FROM_SYSTEM，仅在 OU 时提交。 */
  fromSystem?: string;
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
