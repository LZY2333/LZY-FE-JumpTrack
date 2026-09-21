import type { IopTaskNode, MessageBusinessType, MessageDirection } from '@/types/enums';
import type { IopTaskInfo } from '@/types/iopTask';
import type { RequestConfig } from './request';
import { get, post } from './request';

/* ==================== 1. IOP 任务 ==================== */

/** IOP 任务接口基础 URL。 */
export const API_BASE_IOP_TASK_INFO = '/cips/api/task-info';

/** 按 IOP 工作流实例编号查询页面初始化任务信息。 */
export const API_IOP_TASK_INFO = `${API_BASE_IOP_TASK_INFO}/getbyflwiid/:iopFlwiId`;
export const getIopTask = (iopFlwiId: string, config?: RequestConfig) =>
  get<IopTaskResponse>(API_IOP_TASK_INFO.replace(':iopFlwiId', encodeURIComponent(iopFlwiId)), config);

/** IOP 页面初始化接口返回的数据。 */
export interface IopTaskResponse extends IopTaskInfo {
  /** 报文业务类型。 */
  businessType: MessageBusinessType;
  /** 报文收发方向。 */
  msgDirection: MessageDirection;
}

/** IOP 经办与审批接口的公共请求字段。 */
export interface IopTaskActionRequest {
  /** 本系统任务编号。 */
  taskId: string;
  /** 当前任务环节。 */
  taskNode: IopTaskNode;
  /** 报文编号，取 Task 接口返回的 BUS_REF_NO。 */
  msgId: string;
  /** 当前操作用户 ID。 */
  userId: string;
  /** 当前操作用户机构号。 */
  orgId: string;
  /** IOP 工作流节点编号。 */
  iopWkiId: string;
  /** IOP 工作流节点名称。 */
  iopNodNam: string;
  /** IOP 工作流任务编号。 */
  iopWfTaskId: string;
  /** 经办固定为 true；审批通过为 true，拒绝为 false。 */
  next: boolean;
  /** 审批拒绝原因，仅审批拒绝时传递。 */
  rejectReason?: string;
}

/* ==================== 2. 手工补录 ==================== */

/** 手工补录 接口基础 URL */
export const API_BASE_IOP_MANUAL_ENTRY = '/cips/patchIncomingMsg';

/** 手工补录 更新报文原文 */
export const API_IOP_MANUAL_ENTRY_UPDATE = `${API_BASE_IOP_MANUAL_ENTRY}/updateContentMsg`;
export const postMEUpdate = (params: IopManualEntryUpdateRequest) =>
  post<undefined>(API_IOP_MANUAL_ENTRY_UPDATE, params);

/** 手工补录 确认经办 */
export const API_IOP_MANUAL_ENTRY_CONFIRM = `${API_BASE_IOP_MANUAL_ENTRY}/confirmPatchContentToIOP`;
export const postMEConfirm = (params: IopTaskActionRequest) => post<undefined>(API_IOP_MANUAL_ENTRY_CONFIRM, params);

/** 手工补录 回滚报文原文 */
export const API_IOP_MANUAL_ENTRY_ROLLBACK = `${API_BASE_IOP_MANUAL_ENTRY}/rollbackPatchContent`;
export const postMERollback = (params: IopManualEntryRollbackRequest) =>
  post<undefined>(API_IOP_MANUAL_ENTRY_ROLLBACK, params);

/** 手工补录 审批通过 */
export const API_IOP_MANUAL_ENTRY_APPROVE = `${API_BASE_IOP_MANUAL_ENTRY}/approvePatchContentToIOP`;
export const postMEApprove = (params: IopTaskActionRequest) => post<undefined>(API_IOP_MANUAL_ENTRY_APPROVE, params);

/** 手工补录 审批拒绝 */
export const API_IOP_MANUAL_ENTRY_REJECT = `${API_BASE_IOP_MANUAL_ENTRY}/rejectPatchContentToIOP`;
export const postMEReject = (params: IopTaskActionRequest) => post<undefined>(API_IOP_MANUAL_ENTRY_REJECT, params);

/** 手工补录经办请求。 */
export interface IopManualEntryUpdateRequest {
  /** 报文编号。 */
  msgId: string;
  /** 修改后的临时报文原文。 */
  contentTemp: string;
}

/** 手工补录回滚请求。 */
export interface IopManualEntryRollbackRequest {
  /** 报文编号。 */
  msgId: string;
}

/* ==================== 3. 手工归属 ==================== */

/** 手工归属 接口基础 URL */
export const API_BASE_IOP_MANUAL_ATTRIBUTE = '/cips/attributeTask';

/** 手工归属 经办 */
export const API_IOP_MANUAL_ATTRIBUTE_HANDLING = `${API_BASE_IOP_MANUAL_ATTRIBUTE}/handling`;
export const postMAHandling = (params: IopManualAttributeHandlingRequest) =>
  post<undefined>(API_IOP_MANUAL_ATTRIBUTE_HANDLING, params);

/** 手工归属经办请求。 */
export interface IopManualAttributeHandlingRequest extends IopTaskActionRequest {
  /** 目标系统编号。 */
  targeSysId?: string;
  /** 报文归属部门。 */
  msgOwnerDept?: string;
  /** 报文归属组。 */
  msgOwnerGroup?: string;
}

/* ==================== 4. 创建分发任务 ==================== */

/** 创建分发任务 接口基础 URL */
export const API_BASE_IOP_DISTRIBUTE_CREATION = '/cips/manualCrtDisTask';

/** 创建分发任务 从报文明细页创建 */
export const API_IOP_DISTRIBUTE_CREATION_CREATE = `${API_BASE_IOP_DISTRIBUTE_CREATION}/create`;
export const postDCCreate = (params: IopDistributeCreationCreateRequest) =>
  post<undefined>(API_IOP_DISTRIBUTE_CREATION_CREATE, params);

/** 创建分发任务 经办 */
export const API_IOP_DISTRIBUTE_CREATION_HANDLING = `${API_BASE_IOP_DISTRIBUTE_CREATION}/handling`;
export const postDCHandling = (params: IopDistributeCreationHandlingRequest) =>
  post<undefined>(API_IOP_DISTRIBUTE_CREATION_HANDLING, params);

/** 创建分发任务 表单信息 */
export const API_IOP_DISTRIBUTE_CREATION_FORM = `${API_BASE_IOP_DISTRIBUTE_CREATION}/query`;
export const getDCForm = (msgId: string) =>
  post<IopDistributeCreationFormResponse>(API_IOP_DISTRIBUTE_CREATION_FORM, { msgId });

/** 从报文明细页创建分发任务请求。 */
export interface IopDistributeCreationCreateRequest {
  /** 报文编号。 */
  msgId: string;
  /** 当前操作用户 ID。 */
  userId: string;
  /** 当前操作用户机构号。 */
  orgId: string;
  /** 目标系统编号。 */
  targeSysId?: string;
  /** 报文归属部门。 */
  msgOwnerDept?: string;
  /** 报文归属组。 */
  msgOwnerGroup?: string;
}

/** 创建分发任务经办请求。 */
export interface IopDistributeCreationHandlingRequest extends IopTaskActionRequest {
  /** 目标系统编号。 */
  targeSysId?: string;
  /** 报文归属部门。 */
  msgOwnerDept?: string;
  /** 报文归属组。 */
  msgOwnerGroup?: string;
}

/** 创建分发任务表单信息响应。 */
export interface IopDistributeCreationFormResponse {
  /** 目标系统编号。 */
  targeSysId?: string;
  /** 报文归属部门。 */
  msgOwnerDept?: string;
  /** 报文归属组。 */
  msgOwnerGroup?: string;
}

/* ==================== 5. 分发异常 ==================== */

/** 分发异常 接口基础 URL */
export const API_BASE_IOP_DISTRIBUTE_EXCEPTION = '/cips/distributeTask';

/** 分发异常 重新分发 */
export const API_IOP_DISTRIBUTE_EXCEPTION_HANDLING = `${API_BASE_IOP_DISTRIBUTE_EXCEPTION}/handling`;
export const postDERetry = (params: IopDistributeExceptionHandlingRequest) =>
  post<undefined>(API_IOP_DISTRIBUTE_EXCEPTION_HANDLING, params);

/** 分发异常经办请求。 */
export interface IopDistributeExceptionHandlingRequest extends IopTaskActionRequest {
  /** 目标系统编号。 */
  targeSysId?: string;
  /** 报文归属部门。 */
  msgOwnerDept?: string;
  /** 报文归属组。 */
  msgOwnerGroup?: string;
}

/* ==================== 6. 查询查复 ==================== */

/** 查询查复 接口基础 URL */
export const API_BASE_IOP_INQUIRY_REPLY = '/cips/manager/manualCipsMsg';

/** 查询查复 从报文明细页创建 IOP 任务 */
export const API_IOP_INQUIRY_REPLY_CREATE = `${API_BASE_IOP_INQUIRY_REPLY}/startProcess`;
export const postIRCreate = (params: IopInquiryReplyCreateRequest) =>
  post<undefined>(API_IOP_INQUIRY_REPLY_CREATE, params);

/** 查询查复 经办与审批 */
export const API_IOP_INQUIRY_REPLY_APPROVE = `${API_BASE_IOP_INQUIRY_REPLY}/approve`;
export const postIRApprove = (params: IopInquiryReplyActionRequest) =>
  post<undefined>(API_IOP_INQUIRY_REPLY_APPROVE, params);

/** 查询查复 表单信息 */
export const API_IOP_INQUIRY_REPLY_FORM = `${API_BASE_IOP_INQUIRY_REPLY}/form/:taskId`;
export const getIRForm = (taskId: string) =>
  get<IopInquiryReplyFormResponse>(API_IOP_INQUIRY_REPLY_FORM.replace(':taskId', encodeURIComponent(taskId)));

/** 查询查复业务数据。 */
export interface IopInquiryReplyBusData {
  /** 查询查复报文类型。 */
  msgType: string;
  /** 查询查复内容。 */
  content: string;
}

/** 查询查复表单信息响应。 */
export type IopInquiryReplyFormResponse = IopInquiryReplyBusData;

/** 从报文明细页创建查询查复任务请求。 */
export interface IopInquiryReplyCreateRequest {
  /** 原业务报文编号。 */
  msgId: string;
  /** 当前操作用户 ID。 */
  userId: string;
  /** 当前操作用户机构号。 */
  orgId: string;
  /** 查询查复业务数据。 */
  busData: IopInquiryReplyBusData;
}

/** 查询查复经办与审批请求。 */
export interface IopInquiryReplyActionRequest extends IopTaskActionRequest {
  /** 查询查复业务数据，仅经办时传递。 */
  busData?: IopInquiryReplyBusData;
}
