/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#F9FAFB', // Muy claro (casi blanco)
          200: '#E5E7EB', // Claro (gris claro)
          500: '#6B7280', // Principal (gris medio)
          700: '#374151', // Gris oscuro
          900: '#111827', // Más oscuro (negro)
        },
        secondary: {
          100: '#F3F4F6', // Muy claro (gris muy suave)
          200: '#D1D5DB', // Claro (gris suave)
          500: '#4B5563', // Gris oscuro (más oscuro)
          700: '#1F2937', // Más oscuro (casi negro)
          900: '#0F172A', // Negro intenso
        },
        accent: {
          100: '#FFFFFF', // Blanco
          200: '#F3F4F6', // Gris muy claro
          500: '#D1D5DB', // Gris claro
          700: '#9CA3AF', // Gris medio
          900: '#6B7280', // Gris oscuro
        },
        text: {
          100: '#F9FAFB', // Muy claro
          200: '#E5E7EB', // Claro
          300: '#D1D5DB', // Gris suave
          400: '#9CA3AF', // Gris medio claro
          500: '#6B7280', // Gris medio
          600: '#4B5563', // Gris oscuro
          700: '#374151', // Muy oscuro
          800: '#1F2937', // Más oscuro
          900: '#111827', // Negro
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
