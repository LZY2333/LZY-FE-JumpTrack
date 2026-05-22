import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const r = (p) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  root: r('./src/pages'),
  base: '/',
  build: {
    outDir: r('./dist'),
    assetsDir: 'assets',
    minify: false,
    rollupOptions: {
      input: {
        bizList_: r('./src/pages/agent/bizList/index.html'),
        imgQuery_: r('./src/pages/agent/imgQuery/index.html'),
        imgUpload_: r('./src/pages/agent/imgUpload/index.html'),
        imgUploadCts: r('./src/pages/agent/imgUploadCts/index.html'),
        queryNormal_: r('./src/pages/agent/queryNormal/index.html'),
        imUpload: r('./src/pages/im/imUpload/index.html'),
        imApprove: r('./src/pages/im/imApprove/index.html'),
        imQuery: r('./src/pages/im/imQuery/index.html'),
        imReport: r('./src/pages/im/imReport/index.html'),
        imgRollback: r('./src/pages/im/imgRollback/index.html'),
        billMappingOt4: r('./src/pages/imot4/billMapping/index.html'),
        billUpOt4: r('./src/pages/imot4/billUp/index.html'),
      },
      output: {
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
      },
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#E26B66',
          'disabled-color': '#E26B66',
          'link-color': '#E26B66',
          'border-radius-base': '2px',
        },
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': r('./src'),
    },
  },
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 8002,
    proxy: {
      '/api/im/': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: true,
      },
      '/api/v1/image/set/getSetId/': {
        target: 'http://99.85.166.104:5014',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
