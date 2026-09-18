import type { IopWorkflowRequest } from './iop';
import { post } from '../request';

/** 手工归属接口基础 URL。 */
export const API_BASE_IOP_MANUAL_ATTRIBUTE = '/cips/attributeTask';

/** 手工归属 经办 */
export const API_IOP_MANUAL_ATTRIBUTE_HANDLING = `${API_BASE_IOP_MANUAL_ATTRIBUTE}/handling`;
export const postMAHandling = (params: IopManualAttributeHandlingRequest) =>
  post<undefined>(API_IOP_MANUAL_ATTRIBUTE_HANDLING, params);

/** 手工归属经办请求。 */
export interface IopManualAttributeHandlingRequest extends IopWorkflowRequest {
  /** 目标系统编号。 */
  targeSysId?: string;
  /** 报文归属部门。 */
  msgOwnerDept?: string;
  /** 报文归属组。 */
  msgOwnerGroup?: string;
}
