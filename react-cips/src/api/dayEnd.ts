import type { IopTaskInfo } from '@/types/iopTask';
import { get, post } from './request';

/** 日结业务启用标识，Y 表示未日结，N 表示已日结 */
export type DayEndEnableInd = 'Y' | 'N';

/** 日结当前状态 */
export interface DayEndStatus {
  /** 日结状态: Y未日结 */
  enableInd: DayEndEnableInd;
  /** 报文渠道 */
  msgChannel: string;
  /** 最近操作人 */
  authorUser: string;
  /** 最近操作人部门 */
  deption: string;
  /** 最近操作时间 */
  updateTime: string;
}

/** 日结未结束任务检查结果 */
export interface DayEndCheckResult {
  /** 是否可以日结 */
  canDayEnd: boolean;
  /** 未结束任务 */
  pendingTasks: IopTaskInfo[];
}

/** 日结状态变更请求 */
export interface DayEndSubmitRequest {
  /** 报文渠道 */
  msgChannel: string;
  /** 当前操作人机构号 */
  deption: string;
  /** 当前操作用户编号 */
  createUser: string;
  /** 目标业务启用标识 */
  enableInd: DayEndEnableInd;
}

/** 查询渠道和部门当前日结状态 */
export const getDayEndStatus = () => get<DayEndStatus>('/pssst/manager/day-end/status');

/** 检查日结前的未结束任务 */
export const checkDayEnd = () => get<DayEndCheckResult>('/pssst/manager/day-end/check');

/** 提交当前用户确认的日结状态变更 */
export const submitDayEnd = (request: DayEndSubmitRequest) => post<undefined>('/pssst/manager/day-end/submit', request);
