import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

/** 承载被 iframe 内嵌的 IOP 页面，不包含普通页面登录和外围结构。 */
const IopLayout = () => (
  <Layout className='h-screen overflow-hidden bg-white'>
    <Content className='min-h-0 flex-1 overflow-hidden'>
      <Outlet />
    </Content>
  </Layout>
);

export default IopLayout;
