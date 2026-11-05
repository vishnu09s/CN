/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1f2937',
        secondary: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#0ea5e9',
      },
      spacing: {
        '128': '32rem',
      },
      borderRadius: {
        lg: '0.5rem',
      },
    },
  },
  plugins: [],
};
