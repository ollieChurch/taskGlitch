/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        rajdhani: ['Rajdhani', 'sans-serif'],
        wallpoet: ['Wallpoet', 'cursive'],
      },
      colors: {
        'priority-critical': 'var(--color-priority-critical)',
        'priority-high': 'var(--color-priority-high)',
        'priority-medium': 'var(--color-priority-medium)',
        'priority-low': 'var(--color-priority-low)',

        'surface-base': 'var(--color-surface-base)',
        'surface-raised': 'var(--color-surface-raised)',
        'surface-overlay': 'var(--color-surface-overlay)',
        'surface-hover': 'var(--color-surface-hover)',

        'accent': {
          DEFAULT: 'var(--color-accent)',
          dim: 'var(--color-accent-dim)',
          glow: 'var(--color-accent-glow)',
        },

        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-heading': 'var(--color-text-heading)',
        'text-inverse': 'var(--color-text-inverse)',

        'app-success': 'var(--color-success)',
        'app-danger': 'var(--color-danger)',
        'app-warning': 'var(--color-warning)',
        'app-info': 'var(--color-info)',

        'border-default': 'var(--color-border)',
        'border-accent': 'var(--color-border-accent)',
      },
      boxShadow: {
        'glow': '0 0 15px var(--color-accent-glow)',
        'glow-sm': '0 0 8px var(--color-accent-glow)',
        'glow-md': '0 0 20px var(--color-accent-glow), 0 0 40px var(--color-accent-glow)',
        'glow-lg': '0 0 30px var(--color-accent-glow), 0 0 60px var(--color-accent-glow)',
        'inner-highlight': 'inset 0 1px 0 var(--color-surface-highlight)',
      },
    },
  },
  plugins: [],
}
