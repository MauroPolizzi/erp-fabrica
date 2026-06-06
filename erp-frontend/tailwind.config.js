/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
  // PrimeNG trae su propio reset; evitamos que el preflight de Tailwind pise sus estilos.
  corePlugins: {
    preflight: true,
  },
};
