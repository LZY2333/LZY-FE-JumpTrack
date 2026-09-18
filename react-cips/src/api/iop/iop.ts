import type { IopTaskInfo } from '@/types/iopTask';
import type { ApprovalYesNo, MessageBusinessType, MessageDirection } from '@/types/enums';
import type { RequestConfig } from '../request';
import { get } from '../request';

/** IOP Task解析  */
export const API_IOP_TASK_INFO = '/cips/api/task-info/getbywfid/:iopWfTaskId';
export const getIopTask = (iopWfTaskId: string, config?: RequestConfig) =>
  get<IopTaskResponse>(API_IOP_TASK_INFO.replace(':iopWfTaskId', encodeURIComponent(iopWfTaskId)), config);

/** IOP 页面初始化接口返回的数据。 */
export interface IopTaskResponse extends IopTaskInfo {
  /** 报文业务类型。 */
  businessType: MessageBusinessType;
  /** 报文收发方向。 */
  msgDirection: MessageDirection;
}

/** IOP 任务创建接口字段。 */
export interface IopCreateRequest {
  /** 业务流水号；报文任务中为 MSG_ID。 */
  msgId: string;
  /** 当前操作用户 ID。 */
  userId: string;
  /** 当前操作用户机构号。 */
  orgId: string;
}

/** IOP Task 操作公共字段。 */
export interface IopTaskActionRequest extends IopCreateRequest {
  /** 本系统任务编号。 */
  taskId: string;
}

/** IOP 工作流接口公共字段。 */
export interface IopWorkflowRequest extends IopTaskActionRequest {
  /** IOP 工作流节点描述。 */
  iopNodNam: string;
  /** IOP 工作流任务编号。 */
  iopWfTaskId: string;
  /** IOP 工作流节点编号。 */
  iopWkiId: string;
}

/** IOP 审批请求。 */
export interface IopApprovalRequest extends IopTaskActionRequest {
  /** Y 为通过，N 为拒绝。 */
  next: ApprovalYesNo;
  /** 拒绝原因；通过时传空字符串。 */
  rejectReason: string;
}
