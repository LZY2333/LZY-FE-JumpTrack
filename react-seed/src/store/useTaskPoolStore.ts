import { create } from 'zustand';

interface TaskPoolStore {
  refreshVersion: number;
  requestRefresh: () => void;
}

/** 跨页面通知任务池刷新，供任务详情等页面在数据变更后触发列表重新查询。 */
const useTaskPoolStore = create<TaskPoolStore>((set) => ({
  refreshVersion: 0,
  requestRefresh: () => set((state) => ({ refreshVersion: state.refreshVersion + 1 })),
}));

export default useTaskPoolStore;
