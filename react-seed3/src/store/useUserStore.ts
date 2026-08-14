import { create } from 'zustand';
import { getOt4UserApi } from '@/api/users';
import type { User } from '@/types';
import { Role } from '@/types/enums';

const CIES_ROLES = Object.values(Role);

interface AuthStore {
  user?: User;
  setUser: (user: User) => void;
  login: () => Promise<void>;
}

const useUserStore = create<AuthStore>((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
  login: async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const otfUserToken = searchParams.get('otfUserToken')?.trim();
    if (!otfUserToken) return;

    const res = await getOt4UserApi(otfUserToken);
    if (!res?.user) return;

    set({
      user: {
        ...res.user,
        roles: CIES_ROLES.filter((role) => {
          const rolePattern = new RegExp(`cies.*${role}`, 'i');
          return res.roles.some((item) => rolePattern.test(item));
        }),
      },
    });
  },
}));

export default useUserStore;
