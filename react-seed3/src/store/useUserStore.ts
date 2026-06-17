import { create } from 'zustand';
import { loginApi, logoutApi } from '@/api/users';
import { User } from '@/types';

interface AuthStore {
  user?: User;
  setUser: (user: User) => void;
  login: (id: string) => Promise<void>;
  logout: () => Promise<void>;
}

const useUserStore = create<AuthStore>((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
  login: async (id) => {
    const user = await loginApi(id);
    set({ user });
  },
  logout: async () => {
    await logoutApi();
    set({ user: undefined });
  },
}));

export default useUserStore;
