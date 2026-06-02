/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f8ff',
          100: '#ebf1ff',
          200: '#d6e4ff',
          300: '#adc8ff',
          400: '#84a9ff',
          500: '#407bff',
          600: '#255cd9',
          700: '#1842b3',
          800: '#0f2b8c',
          900: '#091a66',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
