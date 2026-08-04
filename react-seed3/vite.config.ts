import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { viteMockServe } from 'vite-plugin-mock';
import path from 'node:path';

export default defineConfig(({ command }) => {
  const mockEnabled = command === 'serve' && process.env.VITE_USE_MOCK === 'true';
  const apiProxyTarget = 'http://localhost:8080';

  return {
    define: {
      __MOCK_ENABLED__: JSON.stringify(mockEnabled),
    },
    plugins: [
      react(),
      svgr(),
      viteMockServe({
        mockPath: 'mock',
        localEnabled: mockEnabled,
        prodEnabled: false,
      }),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true, // antd4 主题 less 必需；运行时主题由 ConfigProvider.config 统一生成 CSS 变量
        },
      },
    },
    server: {
      port: 5173,
      open: true,
      proxy: mockEnabled
        ? undefined
        : {
            '/api': {
              target: apiProxyTarget,
              changeOrigin: true,
            },
          },
    },
  };
});
