import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#050816',
        brand: {
          50: '#fdf2ff',
          100: '#fbe6ff',
          200: '#f5c6ff',
          300: '#ed9dff',
          400: '#dd6bff',
          500: '#c241ff',
          600: '#9a30db',
          700: '#7423aa',
          800: '#4e1775',
          900: '#31104b'
        },
        accent: '#ffb347',
        surface: '#0b1020'
      }
    }
  },
  plugins: []
};

export default config;
