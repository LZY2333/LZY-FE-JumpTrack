import type { Pagination } from './request';
import { post } from './request';
import type { LcwInitialStatus, MessageBusinessType, MessageChannel, MessageDirection } from '@/types/enums';

/** LCW 接口基础 URL。 */
export const API_BASE_LCW = '/cips/manager/amlPatchStatus';

/** 查询 LCW 任务 list。 */
export const API_LCW_TASK_QUERY = `${API_BASE_LCW}/getAmlMsgByInitialStatus`;
export const getLcwTasks = (params: LcwQuery) => post<PagedLcwRecords>(API_LCW_TASK_QUERY, params);

/** 重试 LCW 任务。 */
export const API_LCW_TASK_RETRY = `${API_BASE_LCW}/pushPatchAmlMsgByMsgid`;
export const retryLcwTasks = (request: LcwBatchRetryRequest) => post<undefined>(API_LCW_TASK_RETRY, request);

/** LCW 列表查询条件。 */
export interface LcwQueryConditions {
  /** 收发方向，决定收发报时间关联的主表。 */
  msgDirection: MessageDirection;
  /** 收发报日期起点，格式为 YYYY-MM-DD */
  msgDateFrom?: string;
  /** 收发报日期终点，格式为 YYYY-MM-DD */
  msgDateTo?: string;
  /** 报文标识号，按完整编号匹配。 */
  msgId?: string;
  /** 收发报通道。 */
  channel?: MessageChannel[];
}

/** LCW 列表分页查询请求。 */
export interface LcwQuery extends LcwQueryConditions {
  /** 当前页码，从 1 开始。 */
  current: number;
  /** 每页记录数。 */
  pageSize: number;
}

/** LCW 列表分页查询结果。 */
export interface PagedLcwRecords extends Pagination {
  /** 当前页 LCW 记录。 */
  list: LcwRecord[];
}

/** LCW 批量重试请求。 */
export interface LcwBatchRetryRequest {
  /** 去重后的报文标识号。 */
  msgIds: string[];
}

/** LCW 列表记录。 */
export interface LcwRecord {
  /** 报文标识号：MSG_ID。 */
  msgId: string;
  /** 报文收发标志：MSG_DIRECTION。 */
  msgDirection: MessageDirection;
  /** 报文业务类型。 */
  businessType: MessageBusinessType;
  /** 收发报时间：IN.MSG_RECV_DATE / OU.MSG_SEND_DATE。 */
  msgDate: string | null;
  /** 收发报通道：MSG_CHANNEL。 */
  msgChannel: MessageChannel;
  /** LCW 初次判定状态：LCW_INITIAL_STATUS。 */
  lcwInitialStatus: LcwInitialStatus;
  /** LCW 接口响应编码：RES_CODE。 */
  resCode: string | null;
  /** LCW 接口响应信息：RES_MESSAGE。 */
  resMessage: string | null;
  /** LCW 初次判定完成时间：LCW_INITIAL_TIME。 */
  lcwInitialTime: string | null;
}
