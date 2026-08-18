import { BrowserRouter } from 'react-router-dom';
import { AliveScope } from 'react-activation';
import { App as AntdApp, ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import enUS from 'antd/locale/en_US';
import AntdAppBridge from '@/components/AntdAppBridge';
import GlobalLoading from '@/components/GlobalLoading';
import AuthGate from '@/router/AuthGate';
import AppRoutes from '@/router';

const APP_THEME: ThemeConfig = {
  cssVar: true,
  token: {
    colorPrimary: '#e26b66',
  },
  components: {
    Form: {
      itemMarginBottom: 0,
    },
  },
};

const App = () => (
  <ConfigProvider locale={enUS} theme={APP_THEME}>
    <AntdApp>
      {/* AntdApp 提供 App.useApp() 所需上下文；Bridge 仅服务于无法调用 Hook 的请求层。 */}
      <AntdAppBridge />
      <GlobalLoading />
      <BrowserRouter>
        <AliveScope>
          <AuthGate>
            <AppRoutes />
          </AuthGate>
        </AliveScope>
      </BrowserRouter>
    </AntdApp>
  </ConfigProvider>
);

export default App;
