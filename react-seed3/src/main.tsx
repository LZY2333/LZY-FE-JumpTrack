import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import 'antd/dist/antd.variable.css';
import './index.css';
import App from './App';
import useUserStore from '@/store/useUserStore';

// 由 Ant Design 根据主色生成完整色阶，统一覆盖 hover、focus、active、outline 等状态。
ConfigProvider.config({
  theme: {
    primaryColor: '#e26b66',
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const renderApp = () => ReactDOM.createRoot(rootElement).render(<App />);

const initializeApp = async () => {
  if (!__MOCK_ENABLED__) {
    await useUserStore
      .getState()
      .login()
      .catch(() => undefined);
  }
  renderApp();
};

void initializeApp();
