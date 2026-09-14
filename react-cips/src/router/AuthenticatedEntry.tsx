import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import useUserStore from '@/store/useUserStore';

/** 普通页面认证入口，在页面渲染后异步初始化用户。 */
const AuthenticatedEntry = () => {
  const login = useUserStore((state) => state.login);
  const loginStartedRef = useRef(false);

  useEffect(() => {
    if (__MOCK_ENABLED__ || loginStartedRef.current) return;

    loginStartedRef.current = true;
    login().catch(() => undefined);
  }, [login]);

  return <Outlet />;
};

export default AuthenticatedEntry;
