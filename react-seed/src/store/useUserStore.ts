import { create } from 'zustand';
import { getCurrentUserApi } from '@/api/users';
import type { User } from '@/types';
import { AuthStatus, Role } from '@/types/enums';

const CIES_ROLES = Object.values(Role);

interface AuthStore {
  user?: User;
  authStatus: AuthStatus;
  setUser: (user: User) => void;
  login: () => Promise<void>;
}

const useUserStore = create<AuthStore>((set) => ({
  user: undefined,
  authStatus: __MOCK_ENABLED__ ? AuthStatus.Anonymous : AuthStatus.Checking,
  setUser: (user) => set({ user, authStatus: AuthStatus.Authenticated }),
  login: async () => {
    set({ authStatus: AuthStatus.Checking });

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token')?.trim();
    if (!token) {
      set({ user: undefined, authStatus: AuthStatus.Anonymous });
      return;
    }

    try {
      const res = await getCurrentUserApi(token);
      if (!res?.user) {
        set({ user: undefined, authStatus: AuthStatus.Anonymous });
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
        authStatus: AuthStatus.Authenticated,
      });
    } catch (error) {
      set({ user: undefined, authStatus: AuthStatus.Anonymous });
      throw error;
    }
  },
}));

export default useUserStore;
