import { useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, matchRoutes, useLocation } from 'react-router-dom';
import { routes } from '@/router/routes';
import DevUserSwitcher from '@/components/DevUserSwitcher';

const { Content } = Layout;

const APP_TITLE = 'CIES Declaration System';

export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    const matched = matchRoutes(routes, location);
    const title = matched?.[matched.length - 1]?.route.meta?.title;
    document.title = title ? `${title} - ${APP_TITLE}` : APP_TITLE;
  }, [location]);

  return (
    <Layout className='h-screen overflow-hidden'>
      <DevUserSwitcher />
      <Content className='min-h-0 overflow-x-hidden overflow-y-auto p-6'>
        <Outlet />
      </Content>
    </Layout>
  );
}
