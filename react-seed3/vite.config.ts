import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { viteMockServe } from 'vite-plugin-mock';
import path from 'node:path';

const API_PROXY_TARGETS: Record<string, string> = {
  development: 'http://localhost:8080',
  dev: 'https://dev-api.example.com',
  st: 'https://st-api.example.com',
  uat: 'https://uat-api.example.com',
};

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), ['APP_']);
  const mockEnabled = command === 'serve' && process.env.MOCK_ENABLED === 'true';
  const apiProxyTarget = API_PROXY_TARGETS[mode] || API_PROXY_TARGETS.development;

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
    build: {
      outDir: path.resolve(__dirname, 'dist', env.APP_OUT_PATH || ''),
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
