import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import useUserStore from '@/store/useUserStore';

/** 主页面路由守卫，在页面渲染后异步初始化用户。 */
const MainGuard = () => {
  const login = useUserStore((state) => state.login);
  const loginStartedRef = useRef(false);

  useEffect(() => {
    if (__MOCK_ENABLED__ || loginStartedRef.current) return;

    loginStartedRef.current = true;
    login().catch(() => undefined);
  }, [login]);

  return <Outlet />;
};

export default MainGuard;
