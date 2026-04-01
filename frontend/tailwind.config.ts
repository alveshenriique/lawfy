import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        lawfy: {
          primary: '#294f62',
          'primary-light': '#3b6b80',
          'primary-soft': '#e6eef2',
          accent: '#1f3a4a',
          bg: '#f5f7fa',
          surface: '#ffffff',
          text: '#0f172a',
          'text-soft': '#64748b',
          success: '#10b981',
          error: '#ef4444',
        },
      },
      borderRadius: {
        lawfy: '0.75rem',
      },
    },
  },
  plugins: [],
} satisfies Config;