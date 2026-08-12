import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { viteMockServe } from 'vite-plugin-mock';
import path from 'node:path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), ['APP_']);
  const mockEnabled = command === 'serve' && process.env.MOCK_ENABLED === 'true';
  const apiBaseUrl = env.APP_API_BASE_URL || '';

  return {
    // 该配置会注入浏览，用于SRC内代码读取，不要暴露token
    // 新增define，需要同步修改vite-env.d.ts
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV || mode),
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
    build: {
      outDir: path.resolve(__dirname, 'dist', env.APP_OUTPUT_PATH || ''),
    },
    server: {
      port: 5173,
      open: true,
      proxy: mockEnabled
        ? undefined
        : {
            '/api': {
              target: apiBaseUrl.startsWith('//') ? `https:${apiBaseUrl}` : apiBaseUrl,
              changeOrigin: true,
            },
          },
    },
  };
});
