import { Layout, Menu, Select } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/useAuthStore';

const { Sider, Header, Content } = Layout;

export default function MainLayout() {
  const { user, userOptions, setUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', label: 'Task Pool' },
    ...(user.roles.includes('admin') ? [{ key: '/admin/permissions', label: '权限配置' }] : []),
  ];

  return (
    <Layout className="min-h-screen">
      <Sider>
        <div className="flex h-16 items-center px-4 font-semibold text-red-700">
          CIES 申报系统
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="flex items-center justify-end gap-3">
          <span>{user.name}</span>
          <Select
            value={user.id}
            onChange={setUser}
            size="small"
            className="w-48"
            options={userOptions.map(u => ({
              value: u.id,
              label: `${u.id} · ${u.name} (${u.roles.join('/')})`,
            }))}
          />
        </Header>
        <Content className="p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
