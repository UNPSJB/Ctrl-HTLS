/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#EDE7F6', // Muy claro
          300: '#B39DDB', // Claro
          500: '#7E57C2', // Principal (60%)
          700: '#512DA8', // Oscuro
          900: '#311B92', // Más oscuro
        },
        secondary: {
          100: '#F3E5F5', // Muy claro
          300: '#CE93D8', // Claro
          500: '#AB47BC', // Principal (30%)
          700: '#8E24AA', // Oscuro
          900: '#6A1B9A', // Más oscuro
        },
        accent: {
          100: '#FFF3E0', // Muy claro
          300: '#FFB74D', // Claro
          500: '#FF9800', // Principal (10%)
          700: '#F57C00', // Oscuro
          900: '#E65100', // Más oscuro
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
};
