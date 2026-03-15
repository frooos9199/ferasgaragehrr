/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        hrr: {
          red: '#DC2626',
          dark: '#111111',
          gray: '#1E1E1E',
          steel: '#2D2D2D',
          silver: '#A0A0A0',
          gold: '#F59E0B',
        }
      },
      fontFamily: {
        heading: ['Rajdhani', 'sans-serif'],
        body: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
