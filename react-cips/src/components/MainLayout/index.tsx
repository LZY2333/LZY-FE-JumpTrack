import { lazy, Suspense, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, matchRoutes, useLocation } from 'react-router-dom';
import { routes } from '@/router/routes';

const { Content } = Layout;

const APP_TITLE = '报文管理系统';
const DevUserSwitcher = __MOCK_ENABLED__ ? lazy(() => import('@/components/DevUserSwitcher')) : undefined;

export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    const matched = matchRoutes(routes, location);
    const title = matched?.[matched.length - 1]?.route.meta?.title;
    document.title = title ? `${title} - ${APP_TITLE}` : APP_TITLE;
  }, [location]);

  return (
    <Layout className='h-screen overflow-hidden'>
      {DevUserSwitcher && (
        <Suspense fallback={null}>
          <DevUserSwitcher />
        </Suspense>
      )}
      <Content className='min-h-0 overflow-x-hidden overflow-y-auto p-6'>
        <Outlet />
      </Content>
    </Layout>
  );
}
