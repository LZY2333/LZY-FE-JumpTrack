import { create } from 'zustand';
import { getCurrentUserApi } from '@/api/users';
import type { User } from '@/types';
import { Role } from '@/types/enums';

const CIES_ROLES = Object.values(Role);

interface AuthStore {
  user?: User;
  setUser: (user: User) => void;
  login: () => Promise<undefined>;
}

const useUserStore = create<AuthStore>((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
  login: async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token')?.trim();
    if (!token) {
      set({ user: undefined });
      return;
    }

    try {
      const res = await getCurrentUserApi(token);
      if (!res?.user) {
        set({ user: undefined });
        return;
      }

      set({
        user: {
          ...res.user,
          roles: CIES_ROLES.filter((role) => {
            const rolePattern = new RegExp(`cies.*${role}`, 'i');
            return res.roles.some((item) => rolePattern.test(item));
          }),
        },
      });
    } catch (error) {
      set({ user: undefined });
      throw error;
    }
  },
}));

export default useUserStore;
