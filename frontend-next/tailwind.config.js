/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#070A11',
          panel: '#0D1322',
          surface: '#121A2F',
          border: '#1A253C',
          muted: '#24324E',
        },
        scada: {
          cyan: '#06B6D4',
          'cyan-glow': '#22D3EE',
          amber: '#F59E0B',
          'amber-glow': '#FBBF24',
          cobalt: '#3B82F6',
          'cobalt-glow': '#60A5FA',
          rose: '#F43F5E',
          'rose-glow': '#FB7185',
          emerald: '#10B981',
          'emerald-glow': '#34D399',
        },
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        solar: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        grid: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#1D4ED8',
        },
        glass: {
          DEFAULT: 'rgba(13, 19, 34, 0.75)',
          dark: 'rgba(7, 10, 17, 0.85)',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      backgroundImage: {
        'scada-grid': 'linear-gradient(to right, rgba(26, 37, 60, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(26, 37, 60, 0.35) 1px, transparent 1px)',
        'radar-sweep': 'conic-gradient(from 0deg at 50% 50%, rgba(6, 182, 212, 0.25) 0deg, rgba(6, 182, 212, 0) 60deg, transparent 360deg)',
      },
      backgroundSize: {
        'grid-pattern': '24px 24px',
        'grid-dense': '12px 12px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'radar-spin': 'radar-spin 4s linear infinite',
        'radar-pulse': 'radar-pulse 2.2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'telemetry-scan': 'telemetry-scan 3s ease-in-out infinite',
      },
      keyframes: {
        'radar-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'radar-pulse': {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '70%': { transform: 'scale(2.4)', opacity: '0' },
          '100%': { transform: 'scale(2.8)', opacity: '0' },
        },
        'telemetry-scan': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
