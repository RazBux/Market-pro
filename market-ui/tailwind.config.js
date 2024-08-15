/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'invert-negative-1': '#737373', // Replace with your color value
      },
    },
  },
  plugins: [],
}

