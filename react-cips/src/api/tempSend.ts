import { post } from './request';

/** 模板发报基础 URL */
export const API_TEMP_SEND = '/pssst/manager/api/v1/cips';

/** 生成模板报文 */
export const API_TEMP_SEND_GENERATE = `${API_TEMP_SEND}/template-generate`;
/** 生成模板报文 */
export const generateTempMessage = (request: TempSendRequest) =>
  post<TempSendGeneratedMessage>(API_TEMP_SEND_GENERATE, request);

/** 提交模板报文 */
export const API_TEMP_SEND_SUBMIT = `${API_TEMP_SEND}/template-send`;
/** 提交模板报文 */
export const sendTempMessage = (request: TempSendRequest) => post<unknown>(API_TEMP_SEND_SUBMIT, request);

/** 模板发报请求 */
export interface TempSendRequest {
  /** 完整报文类型 */
  messageType: string;
  /** 模板字段值，金额使用不带千分位的字符串 */
  formValues: Record<string, unknown>;
}

/** 模板拼报结果 */
export interface TempSendGeneratedMessage {
  /** 报文标识号 */
  msgId: string;
  /** 关联标识号 */
  refId: string;
  /** 报文原文 */
  msgContent: string;
  /** 完整报文类型 */
  messageType: string;
}
