import type { IopCreateRequest, IopWorkflowRequest } from './iop';
import { post } from '../request';

/** 创建分发任务接口基础 URL。 */
export const API_BASE_IOP_DISTRIBUTE_CREATION = '/cips/distributeTask';

/** 创建分发任务经办。 */
export const API_IOP_DISTRIBUTE_CREATION_HANDLING = `${API_BASE_IOP_DISTRIBUTE_CREATION}/handling`;
export const postDCHandling = (params: IopDistributeCreationHandlingRequest) =>
  post<undefined>(API_IOP_DISTRIBUTE_CREATION_HANDLING, params);

/** 创建分发任务审批。 */
export const API_IOP_DISTRIBUTE_CREATION_APPROVAL = `${API_BASE_IOP_DISTRIBUTE_CREATION}/approval`;
export const postDCApprove = (params: IopDistributeCreationApprovalRequest) =>
  post<undefined>(API_IOP_DISTRIBUTE_CREATION_APPROVAL, params);

/** 从报文明细页创建分发任务。 */
export const API_IOP_DISTRIBUTE_CREATION_CREATE = `${API_BASE_IOP_DISTRIBUTE_CREATION}/create`;
export const postDCCreate = (params: IopDistributeCreationCreateRequest) =>
  post<undefined>(API_IOP_DISTRIBUTE_CREATION_CREATE, params);

/** 从报文明细页创建分发任务请求。 */
export interface IopDistributeCreationCreateRequest extends IopCreateRequest {
  /** 目标系统编号。 */
  targeSysId?: string;
  /** 报文归属部门。 */
  msgOwnerDept?: string;
  /** 报文归属组。 */
  msgOwnerGroup?: string;
}

/** 创建分发任务经办请求。 */
export interface IopDistributeCreationHandlingRequest extends IopWorkflowRequest {
  /** 目标系统编号。 */
  targeSysId?: string;
  /** 报文归属部门。 */
  msgOwnerDept?: string;
  /** 报文归属组。 */
  msgOwnerGroup?: string;
}

/** 创建分发任务审批请求。 */
export interface IopDistributeCreationApprovalRequest extends IopWorkflowRequest {
  /** true 为通过，false 为拒绝。 */
  next: boolean;
  /** 拒绝原因；通过时传空字符串。 */
  rejectReason: string;
}
