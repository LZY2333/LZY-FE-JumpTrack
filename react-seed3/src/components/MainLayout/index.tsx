import { useEffect } from 'react';
import { Button, Layout, Tag } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { Outlet, matchRoutes, useLocation } from 'react-router-dom';
import useUserStore from '@/store/useUserStore';
import { Role } from '@/types/enums';
import { routes } from '@/router/routes';
import DevUserSwitcher from '@/components/DevUserSwitcher';

const { Header, Content } = Layout;

const ROLE_COLOR: Record<Role, string> = {
  [Role.Maker]: 'blue',
  [Role.Checker]: 'purple',
};

const APP_TITLE = 'CIES 申报系统';

export default function MainLayout() {
  const { user, logout } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    const matched = matchRoutes(routes, location);
    const title = matched?.[matched.length - 1]?.route.meta?.title;
    document.title = title ? `${title} - ${APP_TITLE}` : APP_TITLE;
  }, [location]);

  return (
    <Layout className='min-h-screen'>
      <Header className='flex items-center justify-between'>
        <span className='font-semibold text-red-700'>{APP_TITLE}</span>
        <div className='flex items-center gap-3'>
          <DevUserSwitcher />
          {user ? (
            <>
              <div className='flex gap-1'>
                {user.roles.map(role => (
                  <Tag key={role} color={ROLE_COLOR[role]}>{role}</Tag>
                ))}
              </div>
              <span className='text-sm'>{user.name}</span>
              <Button size='small' icon={<LogoutOutlined />} onClick={logout}>退出</Button>
            </>
          ) : (
            <Button size='small' type='primary' disabled>登录</Button>
          )}
        </div>
      </Header>
      <Content className='p-6'>
        <div className='mx-auto max-w-7xl'>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
