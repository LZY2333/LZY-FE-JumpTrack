import type { IopTaskInfo } from '@/types/iopTask';
import type { ApprovalYesNo, MessageBusinessType, MessageDirection } from '@/types/enums';
import type { RequestConfig } from './request';
import { get, post } from './request';

/** IOP Task解析  */
export const API_IOP_TASK_INFO = '/cips/api/task-info/getbywfid/:iopWfTaskId';
export const getIopTask = (iopWfTaskId: string, config?: RequestConfig) =>
  get<IopTaskResponse>(API_IOP_TASK_INFO.replace(':iopWfTaskId', encodeURIComponent(iopWfTaskId)), config);

/** 手工补录 经办 */
export const API_IOP_MANUAL_ENTRY_UPDATE = '/cips/api/task-info/manual-entry/update';
export const postMEUpdate = (params: IopManualEntryUpdateRequest) =>
  post<undefined>(API_IOP_MANUAL_ENTRY_UPDATE, params);

/** 手工补录重做。 */
export const API_IOP_MANUAL_ENTRY_REDO = '/cips/api/task-info/manual-entry/redo';
export const postMERedo = (params: IopTaskActionRequest) => post<undefined>(API_IOP_MANUAL_ENTRY_REDO, params);

/** 手工补录经办确认。 */
export const API_IOP_MANUAL_ENTRY_CONFIRM = '/cips/api/task-info/manual-entry/confirm';
export const postMEConfirm = (params: IopTaskActionRequest) =>
  post<undefined>(API_IOP_MANUAL_ENTRY_CONFIRM, params);

/** IOP 审批接口。 */
export const API_IOP_TASK_APPROVAL = '/cips/api/task-info/approval';
export const postMEApprove = (params: IopApprovalRequest) => post<undefined>(API_IOP_TASK_APPROVAL, params);

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

/** IOP 经办接口公共字段。 */
export interface IopMakerRequest extends IopTaskActionRequest {
  /** 目标系统编号，按业务类型选传。 */
  targeSysId?: string;
  /** 报文归属部门，按业务类型选传。 */
  msgOwnerDept?: string;
  /** 报文归属组，按业务类型选传。 */
  msgOwnerGroup?: string;
}

/** 手工补录经办请求。 */
export interface IopManualEntryUpdateRequest extends IopMakerRequest {
  /** 修改后的报文原文。 */
  msgContent: string;
}

/** IOP 审批请求。 */
export interface IopApprovalRequest extends IopTaskActionRequest {
  /** Y 为通过，N 为拒绝。 */
  next: ApprovalYesNo;
  /** 拒绝原因；通过时传空字符串。 */
  rejectReason: string;
}
