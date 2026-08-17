/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // 主题色，与 index.css 的 --ant-primary-color 保持一致
        primary: {
          DEFAULT: '#E26B66',
          hover: '#f09892',
          active: '#bd4b4b',
        },
      },
    },
  },
  plugins: [],
};
