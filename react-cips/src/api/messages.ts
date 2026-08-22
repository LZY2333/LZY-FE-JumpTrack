import type { Pagination } from './request';
import { get, getBlob, post, postBlob } from './request';
import type { MessageDetail, MessageProcessingRecord, MessageRaw, MessageRecord } from '@/types';
import type {
  BusinessStatus,
  BusinessType,
  MessageDirection,
  MessageSortField,
  TransmissionStatus,
} from '@/types/enums';

const MESSAGE_API = '/api/example/v1/messages';

export type MessageQuerySortOrder = 'asc' | 'desc';

export interface MessageQueryConditions {
  msgId?: string;
  msgBusinessNo?: string;
  msgType?: string;
  msgDirection?: MessageDirection;
  transmissionStatus?: TransmissionStatus;
  businessStatus?: BusinessStatus;
  messageTimeFrom?: string;
  messageTimeTo?: string;
  businessType?: BusinessType;
  msgChannel?: string;
  mainMsgId?: string;
  msgRelatedId?: string;
  msgEndId?: string;
  msgUetr?: string;
  msgSendInst?: string;
  msgRecvInst?: string;
  sortField?: MessageSortField;
  sortOrder?: MessageQuerySortOrder;
}

export interface MessageQuery extends MessageQueryConditions {
  current: number;
  pageSize: number;
}

export interface PagedMessages extends Pagination {
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
  get<MessageProcessingRecord[]>(`${MESSAGE_API}/${encodeURIComponent(msgId)}/processing-records`);

/** 下载指定报文的原始文件。 */
export const downloadMessage = (msgId: string) => getBlob(`${MESSAGE_API}/${encodeURIComponent(msgId)}/download`);

/** 按当前完整查询条件导出服务端生成的 XLSX。 */
export const exportMessages = (params: MessageQueryConditions) => postBlob(`${MESSAGE_API}/export`, params);
