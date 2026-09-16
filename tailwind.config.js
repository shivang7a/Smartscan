/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ew: {
          bg: '#090d16',
          panel: '#0f172a',
          'panel-hover': '#1e293b',
          border: '#1e293b',
          'border-light': '#334155',
          cyan: '#38bdf8',
          'cyan-dim': 'rgba(56, 189, 248, 0.12)',
          emerald: '#10b981',
          'emerald-dim': 'rgba(16, 185, 129, 0.12)',
          amber: '#f59e0b',
          'amber-dim': 'rgba(245, 158, 11, 0.12)',
          crimson: '#f43f5e',
          'crimson-dim': 'rgba(244, 63, 94, 0.12)',
          purple: '#a855f7',
          'purple-dim': 'rgba(168, 85, 247, 0.12)',
          muted: '#94a3b8',
          text: '#f8fafc',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
