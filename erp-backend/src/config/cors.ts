import type { CorsOptions } from 'cors';
import { env } from './environment';

export const corsOptions: CorsOptions = {
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Sin esto el navegador oculta estas cabeceras al frontend (está en otro origen) y las
  // descargas de reportes no podrían tomar el nombre del archivo ni la cantidad de filas.
  exposedHeaders: ['Content-Disposition', 'X-Report-Rows'],
};
