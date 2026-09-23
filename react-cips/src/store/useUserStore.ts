import { create } from 'zustand';
import { Modal } from 'antd';
import { getCurrentUserApi } from '@/api/users';
import type { RequestError } from '@/api/request';
import type { User } from '@/types';
import { Role } from '@/types/enums';

const CIES_ROLES = Object.values(Role);
const AUTH_TOKEN_KEY = 'otfUserToken';

interface AuthStore {
  /** 当前认证 token。 */
  token?: string;
  /** 当前用户。 */
  user?: User;
  /** 设置用户。 */
  setUser: (user: User) => void;
  /** 初始化普通页面用户。 */
  login: () => Promise<undefined>;
}

const useUserStore = create<AuthStore>((set, get) => ({
  token: undefined,
  user: undefined,
  setUser: (user) => set({ user }),
  login: async () => {
    console.log('window.location.href: ', window.location.href);
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get(AUTH_TOKEN_KEY)?.trim();
    const token = urlToken || get().token?.trim() || sessionStorage.getItem(AUTH_TOKEN_KEY)?.trim();
    console.log('login token: ', token);

    set({ user: undefined });
    if (!token) {
      Modal.error({
        title: 'Authentication Token Required',
        content: 'The authentication token is missing. Please access the system by logging in through OT4.',
        okText: 'OK',
        closable: false,
        keyboard: false,
        maskClosable: false,
      });
      return undefined;
    }

    try {
      const res = await getCurrentUserApi(token, { silent: true });
      console.log('login res: ', res);
      if (!res?.user?.userId?.trim()) {
        Modal.warning({
          title: 'T24 Account Required',
          content:
            'Your account is not linked to a T24 account. Please bind a T24 account before viewing task details.',
          okText: 'OK',
          closable: false,
          keyboard: false,
          maskClosable: false,
        });
        return undefined;
      }

      /** 计算用户权限 */
      const roles = CIES_ROLES.filter((role) => {
        const rolePattern = new RegExp(`(?:cies.*${role}|${role}.*cies)`, 'i');
        return (res.roles ?? []).some((item) => rolePattern.test(item));
      });
      /** 系统使用的用户信息 */
      const userTemp = { ...res.user, roles };
      console.log('当前登录用户: ', userTemp);
      set({ token, user: userTemp });

      /** 储存session,同时清空searchParam */
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      if (urlToken) {
        const url = new URL(window.location.href);
        url.searchParams.delete(AUTH_TOKEN_KEY);
        window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
      }
      return undefined;
    } catch (error) {
      set({ user: undefined });
      const errorMsg =
        (error as Partial<RequestError>)?.message?.trim() || 'Unable to verify your identity. Please try again later.';
      Modal.error({
        title: 'Authentication Failed',
        content: errorMsg,
        okText: 'OK',
        closable: false,
        keyboard: false,
        maskClosable: false,
      });
      return undefined;
    }
  },
}));

export default useUserStore;
