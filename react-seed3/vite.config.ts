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
      mockPath: 'mock',
      localEnabled: command === 'serve', // 仅在 dev server 拦截请求，build 产物不包含 mock
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // antd4 主题 less 必需；当前主题色由 index.css 的 CSS 变量负责，故不配 modifyVars
      },
    },
  },
  server: { port: 5173, open: true },
}));
