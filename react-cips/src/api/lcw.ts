import type { Pagination } from './request';
import { post } from './request';
import type { LcwRecord } from '@/types';
import type { LcwInitialStatus, MessageChannel, MessageDirection, QuerySortOrder } from '@/types/enums';

const LCW_PATCH_STATUS_API = '/cips/amlPatchStatus';

/** LCW 列表服务端排序字段。 */
export type LcwSortField = 'msgDate' | 'lcwInitialTime';

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
  /** 需要查询的 LCW 初次判定状态。 */
  lcwInitialStatuses?: LcwInitialStatus[];
  /** LCW 接口响应编码。 */
  resCode?: string;
  /** 服务端排序字段。 */
  sortField?: LcwSortField;
  /** 服务端排序方向。 */
  sortOrder?: QuerySortOrder;
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

/** 分页查询 LCW 任务。 */
export const getLcwTasks = (params: LcwQuery) =>
  post<PagedLcwRecords>(`${LCW_PATCH_STATUS_API}/getAmlMsgByInitialStatus`, params);

/** 批量提交 LCW 任务重试。 */
export const retryLcwTasks = (request: LcwBatchRetryRequest) =>
  post<undefined>(`${LCW_PATCH_STATUS_API}/pushPatchAmlMsgByMsgid`, request);
