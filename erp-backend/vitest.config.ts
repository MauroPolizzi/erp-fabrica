import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    // Carga .env.test antes de la config del backend (base de datos de tests).
    setupFiles: ['./tests/setup.ts'],
    // Los tests de integración comparten una base real: ejecutarlos en serie
    // evita choques entre archivos.
    fileParallelism: false,
  },
});
