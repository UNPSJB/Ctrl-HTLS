/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8', // Azul (ajústalo según tu necesidad)
        accent: '#F59E0B', // Naranja
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        custom: ['"Custom Font"', 'cursive'],
      },
    },
  },
  plugins: [],
};
