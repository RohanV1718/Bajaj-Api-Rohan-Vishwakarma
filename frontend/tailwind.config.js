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
          100: '#eef3ff',
          200: '#dce5ff',
          300: '#bdd0ff',
          400: '#94b0ff',
          500: '#5b82ff',
          600: '#385eff',
          700: '#2746eb',
          800: '#1f38c4',
          900: '#1e329c',
          950: '#121c61',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
