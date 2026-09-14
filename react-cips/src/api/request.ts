import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import { ResCode } from '@/types/enums';

const request = axios.create({
  timeout: import.meta.env.DEV ? 0 : 20000,
});

// 统一响应拦截器：JSON 接口做业务 returnCode 判定并透传 ApiResult。
request.interceptors.response.use(
  (response) => {
    const apiResult = response.data as ApiResult;
    // 约定：非 SUC0000 即业务错误，统一提示并中断 Promise 链
    if (apiResult && apiResult.returnCode !== ResCode.Success) {
      const requestError: RequestError = {
        code: apiResult.returnCode,
        message: apiResult.errorMsg || `Business error: returnCode=${apiResult.returnCode}`,
      };
      const config = response.config as RequestConfig;
      if (!config.silent) message.error(requestError.message);
      return Promise.reject(requestError);
    }
    // 拦截器实际把业务体透传给调用方；调用方用 request.get<T, ApiResult<T>> 指定解析类型。
    // 此处 cast 仅为满足 axios 拦截器声明的 AxiosResponse 返回类型。
    return apiResult as unknown as AxiosResponse;
  },
  (error) => {
    const apiResult = error.response?.data as ApiResult | undefined;
    const status = error.response?.status as number | undefined;
    // 请求错误依次按后端 returnCode/errorMsg、HTTP status、Axios code/message 判断，
    // 分别覆盖业务错误、HTTP 错误、网络或客户端错误，最后使用统一网络错误文案兜底。
    const requestError: RequestError = {
      code: apiResult?.returnCode || (status ? String(status) : error.code || 'NETWORK_ERROR'),
      message:
        apiResult?.errorMsg ||
        (status ? `Request failed (${status})` : error.message || 'Network error. Please try again later.'),
    };
    if (!error.config?.silent) message.error(requestError.message);
    return Promise.reject(requestError);
  },
);

// 统一封装 JSON get/post：body 可能缺省或为 null，由具体接口调用方处理。
export const get = <T>(url: string, config?: RequestConfig) =>
  request.get<ApiResult<T>, ApiResult<T>>(url, config).then((res) => res.body);

export const post = <T>(url: string, data?: unknown) =>
  request.post<ApiResult<T>, ApiResult<T>>(url, data).then((res) => res.body);

export default request;

/** 接口请求配置。 */
export interface RequestConfig extends AxiosRequestConfig {
  /** 是否由调用方自行展示错误，避免与全局提示重复。 */
  silent?: boolean;
}

/** 全局统一请求错误对象。 */
export interface RequestError {
  /** 业务错误码、HTTP 状态码或网络错误码。 */
  code: string;
  /** 后端返回的错误信息。 */
  message: string;
}

// 后端响应体 DTO。
export interface ApiResult<T = unknown> {
  /** 状态码,SUC0000为成功,其他为失败 */
  returnCode: string;
  /** 返回数据，含分页信息(如果有)；无响应数据时可能缺省或为 null */
  body?: T;
  /** 异常信息 */
  errorMsg?: string;
}

export interface Pagination {
  /** 当前页码 */
  current: number;
  /** 页容量 */
  pageSize: number;
  /** 总数 */
  total: number;
}
