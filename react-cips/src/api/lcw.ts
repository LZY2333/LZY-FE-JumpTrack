import type { Pagination } from './request';
import { post } from './request';
import type { LcwRecord } from '@/types';
import type { MessageChannel, MessageDirection } from '@/types/enums';

/** LCW 接口基础 URL。 */
export const API_BASE_LCW = '/cips/amlPatchStatus';

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
  /** 收发报时间起点，包含边界。 */
  msgDateFrom?: string;
  /** 收发报时间终点，包含边界。 */
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
