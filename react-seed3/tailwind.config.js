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
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        fade: 'fade 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
