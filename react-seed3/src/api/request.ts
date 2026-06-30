import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { message } from 'antd';

// 后端统一响应体约定：{ code, data, ... }，code 0 表示成功
export interface ApiResult<T = unknown> {
  code: number;
  data: T;
  total?: number;
  msg?: string;
}

const request = axios.create({
  baseURL: '',
  timeout: 10000,
});

// 统一响应拦截器：对返回值做一遍过滤——剥离 HTTP 外壳、做业务 code 判定，
// 调用方拿到的直接是业务体（{ code, data, total }）。
// DEMO：当前 mock 统一返回 { code: 0, data }，字段名/判定规则后续按真实接口调整即可。
request.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResult;
    // 约定：非 0 即业务错误，统一提示并中断 Promise 链
    if (body && typeof body.code === 'number' && body.code !== 0) {
      message.error(body.msg || '请求失败，请稍后重试');
      return Promise.reject(new Error(body.msg || `业务错误 code=${body.code}`));
    }
    // 拦截器实际把业务体透传给调用方；调用方用 request.get<T, ApiResult<T>> 指定解析类型。
    // 此处 cast 仅为满足 axios 拦截器声明的 AxiosResponse 返回类型。
    return body as unknown as AxiosResponse;
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

export default request;
