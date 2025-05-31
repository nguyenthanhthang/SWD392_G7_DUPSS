/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // indigo-500
          light: '#EEF2FF', // indigo-50
        },
        secondary: {
          DEFAULT: '#6B7280', // gray-500
        },
        success: {
          DEFAULT: '#10B981', // emerald-500
        },
        danger: {
          DEFAULT: '#EF4444', // red-500
        },
        warning: {
          DEFAULT: '#F59E0B', // amber-500
        },
        info: {
          DEFAULT: '#6366F1', // indigo-500
        },
        dark: {
          DEFAULT: '#111827', // gray-900
        },
        light: {
          DEFAULT: '#F9FAFB', // gray-50
        },
        bodytext: '#4B5563', // gray-600
        lightprimary: '#EEF2FF', // indigo-50
        lighthover: '#F3F4F6', // gray-100
        darkmuted: '#374151', // gray-700
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        '30': '30px',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
