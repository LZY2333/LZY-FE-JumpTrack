import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { message } from 'antd';
import { ResCode } from '@/types/enums';

// 后端响应体DTO
export interface ApiResult<T = unknown> {
  /** 状态码,SUC0000为成功,其他为失败 */
  returnCode: string;
  /** 返回数据，含分页信息(如果有)；成功响应约定 body 必有值，无 body 的接口不走 get/post 泛型 */
  body: T;
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

const request = axios.create({
  baseURL: '',
  timeout: 10000,
});

// 统一响应拦截器：对返回值做一遍过滤——剥离 HTTP 外壳、做业务 returnCode 判定，
// 调用方拿到的直接是业务体（{ returnCode, body, errorMsg }）。
request.interceptors.response.use(
  (response) => {
    const apiResult = response.data as ApiResult;
    // 约定：非 SUC0000 即业务错误，统一提示并中断 Promise 链
    if (apiResult && apiResult.returnCode !== ResCode.Success) {
      message.error(apiResult.errorMsg || '请求失败，请稍后重试');
      return Promise.reject(new Error(apiResult.errorMsg || `业务错误 returnCode=${apiResult.returnCode}`));
    }
    // 拦截器实际把业务体透传给调用方；调用方用 request.get<T, ApiResult<T>> 指定解析类型。
    // 此处 cast 仅为满足 axios 拦截器声明的 AxiosResponse 返回类型。
    return apiResult as unknown as AxiosResponse;
  },
  (error) => {
    // 网络层 / HTTP 状态码错误统一兜底提示
    const msg = error?.response?.status
      ? `请求失败（${error.response.status}）`
      : error?.message || '网络异常，请稍后重试';
    message.error(msg);
    return Promise.reject(error);
  },
);

// 统一封装 get/post：ApiResult.body 为必需字段，直接透传即可，
export const get = <T>(url: string) => request.get<ApiResult<T>, ApiResult<T>>(url).then((res) => res.body);

export const post = <T>(url: string, data?: unknown) =>
  request.post<ApiResult<T>, ApiResult<T>>(url, data).then((res) => res.body);

export default request;
