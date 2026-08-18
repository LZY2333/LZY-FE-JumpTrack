/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    // 页面重置由 antd App 在自身作用域内提供，避免 Tailwind Preflight 全局改写组件基础样式。
    preflight: false,
  },
  plugins: [],
};
