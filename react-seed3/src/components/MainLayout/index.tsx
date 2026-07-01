import { useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, matchRoutes, useLocation } from 'react-router-dom';
import { routes } from '@/router/routes';
import DevUserSwitcher from '@/components/DevUserSwitcher';

const { Content } = Layout;

const APP_TITLE = 'CIES 申报系统';

export default function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    const matched = matchRoutes(routes, location);
    const title = matched?.[matched.length - 1]?.route.meta?.title;
    document.title = title ? `${title} - ${APP_TITLE}` : APP_TITLE;
  }, [location]);

  return (
    <Layout className='min-h-screen'>
      <DevUserSwitcher />
      <Content className='p-6'>
        <div className='mx-auto max-w-7xl'>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
