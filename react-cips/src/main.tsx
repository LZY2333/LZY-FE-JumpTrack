import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import useUserStore from '@/store/useUserStore';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(<App />);

if (!__MOCK_ENABLED__) useUserStore.getState().login().catch(() => undefined);
