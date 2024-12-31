/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#F9FAFB',
          200: '#E5E7EB',
          500: '#6B7280',
          700: '#374151',
          900: '#111827',
        },
        secondary: {
          100: '#F3F4F6',
          200: '#D1D5DB',
          500: '#4B5563',
          700: '#1F2937',
          900: '#0F172A',
        },
        accent: {
          100: '#FFFFFF',
          200: '#F3F4F6',
          500: '#D1D5DB',
          700: '#9CA3AF',
          900: '#6B7280',
        },
        text: {
          100: '#F9FAFB',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      fontSize: {
        xs: ['0.75rem', '1rem'], // Pequeño
        sm: ['0.875rem', '1.25rem'], // Texto base pequeño
        base: ['1rem', '1.5rem'], // Texto base
        lg: ['1.125rem', '1.75rem'], // Título pequeño
        xl: ['1.25rem', '1.75rem'], // Título mediano
        '2xl': ['1.5rem', '2rem'], // Título grande
        '3xl': ['1.875rem', '2.25rem'], // Muy grande
        '4xl': ['2.25rem', '2.5rem'], // Extra grande
        '5xl': ['3rem', '1'], // Hero
      },
    },
  },
  plugins: [],
};
