import { Link, Route, Routes } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import Home from './pages/Home';
import About from './pages/About';

const { Header, Content } = Layout;

export default function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['home']}
          items={[
            { key: 'home', label: <Link to="/">Home</Link> },
            { key: 'about', label: <Link to="/about">About</Link> },
          ]}
        />
      </Header>
      <Content style={{ padding: 24 }}>
        <div className="mb-4 rounded-lg bg-sky-50 p-3 text-sm text-sky-700 ring-1 ring-sky-200">
          Tailwind CSS 已启用 ✅
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Content>
    </Layout>
  );
}
