import { create } from 'zustand';
import { getOt4UserApi } from '@/api/users';
import type { User } from '@/types';

interface AuthStore {
  user?: User;
  setUser: (user: User) => void;
  login: () => Promise<void>;
}

const useUserStore = create<AuthStore>((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
  login: async () => {
    const otfUserToken = new URLSearchParams(window.location.search).get('otfUserToken')?.trim();
    if (!otfUserToken) return;

    const res = await getOt4UserApi(otfUserToken);
    if (!res) return;
    set({
      user: {
        ...res.user,
        roles: res.pageRoles.CiesTasks,
      },
    });
  },
}));

export default useUserStore;
