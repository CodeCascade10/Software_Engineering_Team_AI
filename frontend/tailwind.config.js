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
          bg: '#080a0f',
          surface: '#0d1117',
          surface2: '#111722',
          gold: '#f5a623',
          goldDim: 'rgba(245, 166, 35, 0.1)',
          blue: '#4a9eff',
          blueDim: 'rgba(74, 158, 255, 0.1)',
          green: '#3ddc84',
          text: '#e8eaf0',
          muted: '#5a6070',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}