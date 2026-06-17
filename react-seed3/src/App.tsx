  import { BrowserRouter } from 'react-router-dom';
  import { AliveScope } from 'react-activation';
  import { ConfigProvider } from 'antd';
  import zhCN from 'antd/lib/locale/zh_CN';
  import moment from 'moment';
  import 'moment/locale/zh-cn';
  import AppRoutes from '@/router';

  moment.locale('zh-cn');

  export default function App() {
    return (
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <AliveScope>
            <AppRoutes />
          </AliveScope>
        </BrowserRouter>
      </ConfigProvider>
    );
  }