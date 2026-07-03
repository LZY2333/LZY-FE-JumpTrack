  import { BrowserRouter } from 'react-router-dom';
  import { AliveScope } from 'react-activation';
  import { ConfigProvider } from 'antd';
  import enUS from 'antd/lib/locale/en_US';
  import AppRoutes from '@/router';

  export default function App() {
    return (
      <ConfigProvider locale={enUS}>
        <BrowserRouter>
          <AliveScope>
            <AppRoutes />
          </AliveScope>
        </BrowserRouter>
      </ConfigProvider>
    );
  }
