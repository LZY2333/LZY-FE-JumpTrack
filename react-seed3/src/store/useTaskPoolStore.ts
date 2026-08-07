import { create } from 'zustand';

interface TaskPoolStore {
  refreshVersion: number;
  requestRefresh: () => void;
}

const useTaskPoolStore = create<TaskPoolStore>((set) => ({
  refreshVersion: 0,
  requestRefresh: () => set((state) => ({ refreshVersion: state.refreshVersion + 1 })),
}));

export default useTaskPoolStore;
