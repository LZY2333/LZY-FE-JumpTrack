import { BrowserRouter } from 'react-router-dom';
import { AliveScope } from 'react-activation';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import GlobalLoading from '@/components/GlobalLoading';
import AppRoutes from '@/router';
import TokenGuard from '@/router/TokenGuard';

export default function App() {
  return (
    <ConfigProvider locale={enUS}>
      <GlobalLoading />
      <BrowserRouter>
        <TokenGuard>
          <AliveScope>
            <AppRoutes />
          </AliveScope>
        </TokenGuard>
      </BrowserRouter>
    </ConfigProvider>
  );
}
