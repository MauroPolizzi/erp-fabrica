/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      // Tokens del sistema de diseño (variables CSS en src/styles.css).
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          DEFAULT: 'var(--color-primary-600)',
        },
        accent: {
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
          DEFAULT: 'var(--color-accent-500)',
        },
        surface: {
          0: 'var(--color-surface-0)',
          50: 'var(--color-surface-50)',
          100: 'var(--color-surface-100)',
          200: 'var(--color-surface-200)',
          300: 'var(--color-surface-300)',
          700: 'var(--color-surface-700)',
          800: 'var(--color-surface-800)',
          900: 'var(--color-surface-900)',
        },
        success: 'var(--color-success)',
        warn: 'var(--color-warn)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
        'text-muted': 'var(--color-text-muted)',
      },
      borderRadius: {
        md: 'var(--radius-md)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
  // PrimeNG trae su propio reset; evitamos que el preflight de Tailwind pise sus estilos.
  corePlugins: {
    preflight: true,
  },
};
