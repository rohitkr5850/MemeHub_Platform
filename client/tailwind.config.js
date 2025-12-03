/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Primary Orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        secondary: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c', // Secondary Gray
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Accent Red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        success: { 500: '#22c55e' },
        warning: { 500: '#eab308' },
        error: { 500: '#ef4444' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 8px 20px rgba(0,0,0,0.12)', // soft elevated shadow
        glow: '0 0 12px rgba(249,115,22,0.6)', // orange glow for hover states
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        memehub: {
          primary: '#f97316',
          secondary: '#78716c',
          accent: '#ef4444',
          neutral: '#1c1917',
          'base-100': '#ffffff',
          'base-200': '#f5f5f4',
          'base-300': '#e7e5e4',
          info: '#3abff8',
          success: '#22c55e',
          warning: '#eab308',
          error: '#ef4444',
        },
        memeHubDark: {
          primary: '#f97316',
          secondary: '#78716c',
          accent: '#ef4444',
          neutral: '#f9fafb',
          'base-100': '#0c0a09',
          'base-200': '#1c1917',
          'base-300': '#292524',
          info: '#3abff8',
          success: '#22c55e',
          warning: '#eab308',
          error: '#ef4444',
        },
      },
    ],
  },
};
