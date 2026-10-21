import { post } from './request';

/** 模板发报请求 */
export interface TempSendRequest {
  /** 完整报文类型 */
  messageType: string;
  /** 模板字段值，金额使用不带千分位的字符串 */
  formValues: Record<string, unknown>;
}

/** 提交模板报文 */
export const sendTempMessage = (request: TempSendRequest) =>
  post<unknown>('/pssst/manager/api/v1/cips/template-send', request);
