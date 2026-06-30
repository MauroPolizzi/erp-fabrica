import { config } from 'dotenv';
import { resolve } from 'node:path';

/**
 * Setup global de Vitest (referenciado en vitest.config.ts -> test.setupFiles).
 *
 * Se ejecuta ANTES de importar la config del backend (src/config/environment.ts),
 * así que carga `.env.test` y deja sus variables en process.env. Como el
 * `import 'dotenv/config'` de environment.ts NO pisa variables ya presentes,
 * la suite corre contra la base de datos de tests y nunca contra la de desarrollo.
 *
 * Incluye guardas para evitar correr accidentalmente contra otra base:
 *  - falla si no existe `.env.test`,
 *  - falla si NODE_ENV no quedó en 'test'.
 */
const result = config({ path: resolve(process.cwd(), '.env.test'), override: true });

if (result.error) {
  throw new Error(
    'No se encontró erp-backend/.env.test. Copiá .env.test.example a .env.test y ' +
      'configurá DATABASE_URL apuntando a la base de datos de tests (erp_test).',
  );
}

if (process.env.NODE_ENV !== 'test') {
  throw new Error('NODE_ENV debe ser "test" para correr la suite (definilo en .env.test).');
}
