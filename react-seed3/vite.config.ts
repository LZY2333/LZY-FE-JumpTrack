import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { viteMockServe } from 'vite-plugin-mock';
import path from 'node:path';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    svgr(),
    viteMockServe({
      mockPath: 'src/mock',
      localEnabled: command === 'serve', // 仅在 dev server 拦截请求，build 产物不包含 mock
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: { port: 5173, open: true },
}));
