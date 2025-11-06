/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ini memberi tahu Tailwind untuk memindai file React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}