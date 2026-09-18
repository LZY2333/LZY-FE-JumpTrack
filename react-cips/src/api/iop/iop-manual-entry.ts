import type { IopApprovalRequest, IopTaskActionRequest } from './iop';
import { post } from '../request';

/** 手工补录接口基础 URL。 */
export const API_BASE_IOP_MANUAL_ENTRY = '/cips/api/task-info/manual-entry';

/** 手工补录 经办 */
export const API_IOP_MANUAL_ENTRY_UPDATE = `${API_BASE_IOP_MANUAL_ENTRY}/update`;
export const postMEUpdate = (params: IopManualEntryUpdateRequest) =>
  post<undefined>(API_IOP_MANUAL_ENTRY_UPDATE, params);

/** 手工补录 经办重做 */
export const API_IOP_MANUAL_ENTRY_REDO = `${API_BASE_IOP_MANUAL_ENTRY}/redo`;
export const postMERedo = (params: IopTaskActionRequest) => post<undefined>(API_IOP_MANUAL_ENTRY_REDO, params);

/** 手工补录 经办确认 */
export const API_IOP_MANUAL_ENTRY_CONFIRM = `${API_BASE_IOP_MANUAL_ENTRY}/confirm`;
export const postMEConfirm = (params: IopTaskActionRequest) => post<undefined>(API_IOP_MANUAL_ENTRY_CONFIRM, params);

/** 手工补录 审批 */
export const API_IOP_TASK_APPROVAL = '/cips/api/task-info/approval';
export const postMEApprove = (params: IopApprovalRequest) => post<undefined>(API_IOP_TASK_APPROVAL, params);

/** 手工补录经办请求。 */
export interface IopManualEntryUpdateRequest extends IopTaskActionRequest {
  /** 修改后的报文原文。 */
  msgContent: string;
}
