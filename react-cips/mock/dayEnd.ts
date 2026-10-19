import type { DayEndCheckResult, DayEndStatus, DayEndSubmitRequest } from '@/api/dayEnd';
import type { ApiResult } from '@/api/request';
import { IOP_TASK_TYPE_LABELS, IopTaskNode, IopTaskType, ResCode } from '@/types/enums';
import type { IopTaskInfo } from '@/types/iopTask';

// 修改下方常量切换页面场景，保存后刷新页面
// pending：Y + 未结束任务；ready：Y + 无任务；ended：N + 无任务
// endedWithPending：N + 未结束任务，允许开启；queryError：初始化查询失败；submitError：Y + 无任务，提交失败
const DAY_END_MOCK_SCENARIO: DayEndMockScenario = 'submitError';

/** 日结页面 Mock 展示场景 */
type DayEndMockScenario = 'pending' | 'ready' | 'ended' | 'endedWithPending' | 'queryError' | 'submitError';

/** 日结 Mock 场景配置 */
interface DayEndMockScenarioConfig {
  /** 初始业务启用标识 */
  enableInd: DayEndStatus['enableInd'];
  /** 是否存在未结束任务 */
  hasPendingTasks: boolean;
  /** 是否模拟初始化查询失败 */
  queryError?: boolean;
  /** 是否模拟提交失败 */
  submitError?: boolean;
}

/** 日结 Mock 提交请求 */
interface DayEndMockRequestOption {
  /** vite-plugin-mock 解析后的请求体 */
  body?: DayEndSubmitRequest;
}

const DAY_END_MOCK_SCENARIOS: Record<DayEndMockScenario, DayEndMockScenarioConfig> = {
  pending: { enableInd: 'Y', hasPendingTasks: true },
  ready: { enableInd: 'Y', hasPendingTasks: false },
  ended: { enableInd: 'N', hasPendingTasks: false },
  endedWithPending: { enableInd: 'N', hasPendingTasks: true },
  queryError: { enableInd: 'Y', hasPendingTasks: false, queryError: true },
  submitError: { enableInd: 'Y', hasPendingTasks: false, submitError: true },
};
const scenarioConfig = DAY_END_MOCK_SCENARIOS[DAY_END_MOCK_SCENARIO];

let currentDayEndStatus: DayEndStatus = {
  enableInd: scenarioConfig.enableInd,
  msgChannel: 'CIPS',
  deption: 'CCC',
  authorUser: 'SYSTEM',
  updateTime: '2026-10-13T07:46:00.000+00:00',
};

// 现有 IOP Mock 未导出任务数据，使用独立只读示例
const PENDING_TASKS: readonly IopTaskInfo[] = [
  {
    taskId: 'TASK20261013000001',
    taskFlowNo: IopTaskType.manualEntry,
    taskFlowName: IOP_TASK_TYPE_LABELS[IopTaskType.manualEntry],
    busRefNo: 'CIPSIN20261013000001',
    taskHoldStatus: 'N',
    taskNode: IopTaskNode.MakerStage,
    inputId: 'U001',
    inputTime: '2026-10-13T07:30:00.000+00:00',
  },
  {
    taskId: 'TASK20261013000002',
    taskFlowNo: IopTaskType.inquiryReply,
    taskFlowName: IOP_TASK_TYPE_LABELS[IopTaskType.inquiryReply],
    busRefNo: 'CIPSIN20261013000002',
    taskHoldStatus: 'N',
    taskNode: IopTaskNode.Checker1Stage,
    inputId: 'U002',
    inputTime: '2026-10-13T07:35:00.000+00:00',
  },
];
const pendingTasks = scenarioConfig.hasPendingTasks ? PENDING_TASKS : [];

/** 查询开发环境当前日结状态 */
const handleDayEndStatus = (): ApiResult<DayEndStatus> => {
  if (scenarioConfig.queryError) {
    return { returnCode: 'ERR0500', errorMsg: 'Day end status query failed. Please refresh to try again.' };
  }

  return { returnCode: ResCode.Success, body: { ...currentDayEndStatus } };
};

/** 检查开发环境未结束任务 */
const handleDayEndCheck = (): ApiResult<DayEndCheckResult> => {
  if (scenarioConfig.queryError) {
    return { returnCode: 'ERR0500', errorMsg: 'Pending task query failed. Please refresh to try again.' };
  }

  return {
    returnCode: ResCode.Success,
    body: {
      canDayEnd: pendingTasks.length === 0,
      pendingTasks: pendingTasks.map((task) => ({ ...task })),
    },
  };
};

/** 提交开发环境日结状态并更新最近操作信息 */
const handleDayEndSubmit = ({ body: request }: DayEndMockRequestOption): ApiResult<undefined> => {
  if (!isDayEndSubmitRequestValid(request)) {
    return { returnCode: 'ERR0400', errorMsg: 'A valid operator, department and enable indicator are required.' };
  }

  if (request.msgChannel !== currentDayEndStatus.msgChannel) {
    return { returnCode: 'ERR0400', errorMsg: 'Message channel must match the current scope.' };
  }

  const isDayEndBlocked = request.enableInd === 'N' && pendingTasks.length > 0;
  if (isDayEndBlocked) {
    return { returnCode: 'ERR0409', errorMsg: 'Pending tasks must be completed before day end.' };
  }

  if (scenarioConfig.submitError) {
    return { returnCode: 'ERR0500', errorMsg: 'Day end status update failed. Please try again.' };
  }

  currentDayEndStatus = {
    ...currentDayEndStatus,
    enableInd: request.enableInd,
    authorUser: request.createUser,
    deption: request.deption,
    updateTime: new Date().toISOString(),
  };
  return { returnCode: ResCode.Success };
};

export default [
  { url: '/pssst/manager/day-end/status', method: 'get', response: handleDayEndStatus },
  { url: '/pssst/manager/day-end/check', method: 'get', response: handleDayEndCheck },
  { url: '/pssst/manager/day-end/submit', method: 'post', response: handleDayEndSubmit },
];

/** 校验日结提交的操作用户、部门和目标状态 */
const isDayEndSubmitRequestValid = (request?: DayEndSubmitRequest): request is DayEndSubmitRequest => {
  if (!request) return false;
  if (typeof request.createUser !== 'string') return false;
  if (!request.createUser.trim()) return false;
  if (typeof request.deption !== 'string') return false;
  if (!request.deption.trim()) return false;
  return request.enableInd === 'Y' || request.enableInd === 'N';
};
