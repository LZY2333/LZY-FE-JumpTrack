import type { ReactElement } from 'react';
import useUserStore from '@/store/useUserStore';
import { AuthStatus } from '@/types/enums';

/** 用户身份未确定时暂停挂载业务路由。 */
const AuthGate = ({ children }: { children: ReactElement }) => {
  const authStatus = useUserStore((state) => state.authStatus);
  if (authStatus === AuthStatus.Checking) return null;

  return children;
};

export default AuthGate;
