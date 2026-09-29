import { useEffect, useState } from 'react';
import { getIopTask } from '@/api/iop';
import type { IopTaskResponse } from '@/api/iop';
import type { RequestError } from '@/api/request';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import useIopUrlParams from './useIopUrlParams';
import type { IopUrlParams } from './useIopUrlParams';

// 为具体 IOP 页面留出启动自身全局 Loading 的交接窗口。
const LOADING_HANDOFF_DELAY_MS = 100;

/** IOP 页面统一使用的 Task 与 URL 参数。 */
export type IopTaskData = Omit<IopTaskResponse, keyof IopUrlParams> & IopUrlParams;

export interface IopContext {
  /** 当前 Task 与 IOP URL 参数组成的页面数据。 */
  data: IopTaskData | null;
  /** Task 正在从接口加载。 */
  loading: boolean;
  /** URL 或接口请求的错误信息。 */
  error?: string;
  /** 重新加载当前 URL 的 Task。 */
  handleRetry: () => void;
}

/** 为 IOP Task 路由守卫加载 Task 信息。 */
const useIopGuard = (): IopContext => {
  const searchParams = useIopUrlParams();
  const [data, setData] = useState<IopTaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [retryVersion, setRetryVersion] = useState(0);

  useEffect(() => {
    let active = true;
    let stopLoadingTimer: number | undefined;
    const stopGlobalLoading = startGlobalLoading();

    /** Task 加载结束后延迟释放全局 Loading，避免与页面请求之间发生闪断。 */
    const finishLoading = () => {
      if (!active) return;
      setLoading(false);
      stopLoadingTimer = window.setTimeout(stopGlobalLoading, LOADING_HANDOFF_DELAY_MS);
    };
    const cleanup = () => {
      active = false;
      window.clearTimeout(stopLoadingTimer);
      stopGlobalLoading();
    };
    const iopFlwiId = searchParams.iopFlwiId.trim();

    setData(null);
    setError(undefined);
    setLoading(true);

    // 1. 获取工作流实例编号
    if (!iopFlwiId) {
      setError('IOP workflow instance ID is missing from the URL.');
      finishLoading();
      return cleanup;
    }

    // 2. 查询任务信息
    getIopTask(iopFlwiId, { silent: true })
      .then((task) => {
        if (!active) return;
        if (!task) {
          setError('IOP task was not found.');
          return;
        }

        setData({
          ...task,
          ...searchParams,
        });
      })
      .catch((requestError: RequestError) => {
        if (active) setError(requestError.message);
      })
      .finally(finishLoading);

    return cleanup;
  }, [retryVersion, searchParams]);

  return {
    data,
    loading,
    error,
    handleRetry: () => setRetryVersion((version) => version + 1),
  };
};

export default useIopGuard;
