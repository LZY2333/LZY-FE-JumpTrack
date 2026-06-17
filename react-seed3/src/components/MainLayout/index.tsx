import { useEffect } from 'react';
import { Button, Layout, Menu, Tag } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { Outlet, matchRoutes, useLocation, useNavigate } from 'react-router-dom';
import useUserStore from '@/store/useUserStore';
import { Role } from '@/types/enums';
import { routes } from '@/router/routes';
import DevUserSwitcher from '@/components/DevUserSwitcher';

const { Sider, Header, Content } = Layout;

const ROLE_COLOR: Record<Role, string> = {
  [Role.Maker]: 'blue',
  [Role.Checker]: 'purple',
  [Role.Admin]: 'red',
};

const APP_TITLE = 'CIES 申报系统';

export default function MainLayout() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', label: 'Task Pool' },
    ...(user?.roles.includes(Role.Admin) ? [{ key: '/admin/permissions', label: '权限配置' }] : []),
  ];

  useEffect(() => {
    const matched = matchRoutes(routes, location);
    const title = matched?.[matched.length - 1]?.route.meta?.title;
    document.title = title ? `${title} - ${APP_TITLE}` : APP_TITLE;
  }, [location]);

  return (
    <Layout className='min-h-screen'>
      <Sider>
        <div className='flex h-16 items-center px-4 font-semibold text-red-700'>{APP_TITLE}</div>
        <Menu
          theme='light'
          mode='inline'
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className='flex items-center justify-end gap-3'>
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
        </Header>
        <Content className='p-6'>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
