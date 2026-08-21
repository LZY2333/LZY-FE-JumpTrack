import { create } from 'zustand';

interface GlobalLoadingStore {
  /** 当前仍在执行、需要展示全局 Loading 的任务数。 */
  pendingCount: number;
  /** 新任务开始时增加计数。业务代码应优先使用 startGlobalLoading。 */
  showLoading: () => void;
  /** 任务结束时减少计数，最低保持为 0。业务代码应优先使用 startGlobalLoading。 */
  hideLoading: () => void;
}

/**
 * 全局 Loading 状态。
 *
 * 使用计数而不是布尔值，避免多个并发任务中任一任务提前结束后，
 * 错误地关闭其他任务仍然需要展示的 Loading。
 */
const useGlobalLoadingStore = create<GlobalLoadingStore>((set) => ({
  pendingCount: 0,
  showLoading: () => set((state) => ({ pendingCount: state.pendingCount + 1 })),
  hideLoading: () => set((state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) })),
}));

/**
 * 开启一次全局 Loading，并返回对应的关闭函数。
 *
 * 关闭函数可以安全地重复调用，适合同时放在 Promise.finally 和组件卸载清理中，
 * 业务代码不需要自行维护 globalLoadingActive 等防重复状态。
 */
export const startGlobalLoading = () => {
  const { showLoading, hideLoading } = useGlobalLoadingStore.getState();
  let active = true;

  showLoading();
  return () => {
    if (!active) return;
    active = false;
    hideLoading();
  };
};

export default useGlobalLoadingStore;
