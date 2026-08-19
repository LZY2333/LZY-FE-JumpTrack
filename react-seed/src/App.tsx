import { BrowserRouter } from 'react-router-dom';
import { AliveScope } from 'react-activation';
import { App as AntdApp, ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import enUS from 'antd/locale/en_US';
import GlobalLoading from '@/components/GlobalLoading';
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
      <GlobalLoading />
      <BrowserRouter>
        <AliveScope>
          <AppRoutes />
        </AliveScope>
      </BrowserRouter>
    </AntdApp>
  </ConfigProvider>
);

export default App;
