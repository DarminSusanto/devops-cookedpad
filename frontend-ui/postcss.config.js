// /frontend-ui/postcss.config.js

export default {
  plugins: {
    // Untuk kompatibilitas dengan environment build (Tailwind v4+),
    // gunakan plugin resmi PostCSS package '@tailwindcss/postcss'.
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}