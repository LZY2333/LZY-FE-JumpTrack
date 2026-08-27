import { create } from 'zustand';
import { Modal } from 'antd';
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
    if (!otfUserToken) {
      set({ user: undefined });
      Modal.error({
        title: 'Authentication Token Required',
        content: 'The authentication token is missing. Please access the system through the authorized entry point.',
        okText: 'OK',
        closable: false,
        keyboard: false,
        maskClosable: false,
      });
      return;
    }

    const res = await getOt4UserApi(otfUserToken);
    if (!res) return;
    if (!res.user?.userId?.trim()) {
      set({ user: undefined });
      Modal.warning({
        title: 'T24 Account Required',
        content: 'Your account is not linked to a T24 account. Please bind a T24 account before viewing task details.',
        okText: 'OK',
        closable: false,
        keyboard: false,
        maskClosable: false,
      });
      return;
    }

    set({
      user: {
        ...res.user,
        roles: CIES_ROLES.filter((role) => {
          const rolePattern = new RegExp(`(?:cies.*${role}|${role}.*cies)`, 'i');
          return res.roles.some((item) => rolePattern.test(item));
        }),
      },
    });
  },
}));

export default useUserStore;
