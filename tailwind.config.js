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
        'priority-critical': '#dc3546',
        'priority-high': '#ffc107',
        'priority-medium': '#1a8754',
        'priority-low': '#10caf0',
        'app-bg': '#d5e7eb',
        'app-success': '#42b983',
      }
    },
  },
  plugins: [],
}
