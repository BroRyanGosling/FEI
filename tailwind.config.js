/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'movie-gold': '#f59e0b',
        'movie-dark': '#0f0f0f',
        'movie-darker': '#050505',
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'serif'],
        'body': ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
