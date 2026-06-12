/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FBF9F4',
        linen: '#F3EFE0',
        ink: '#2B2625',
        bordo: '#722F37',
        forest: '#2C4A3E',
        amber: '#D4A373',
        'old-paper': '#E8E2D5'
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        merriweather: ['"Merriweather"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        inter: ['"Inter"', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        lora: ['"Lora"', 'serif'],
      }
    },
  },
  plugins: [],
}
