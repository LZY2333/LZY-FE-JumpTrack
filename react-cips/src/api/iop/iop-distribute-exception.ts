import type { IopWorkflowRequest } from './iop';
import { post } from '../request';

/** 分发异常接口基础 URL。 */
export const API_BASE_IOP_DISTRIBUTE_EXCEPTION = '/cips/distributeExceptionTask';

/** 分发异常重新分发。 */
export const API_IOP_DISTRIBUTE_EXCEPTION_HANDLING = `${API_BASE_IOP_DISTRIBUTE_EXCEPTION}/handling`;
export const postDERetry = (params: IopDistributeExceptionHandlingRequest) =>
  post<undefined>(API_IOP_DISTRIBUTE_EXCEPTION_HANDLING, params);

/** 分发异常经办请求。 */
export type IopDistributeExceptionHandlingRequest = IopWorkflowRequest;
