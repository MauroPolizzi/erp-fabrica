import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';

// TODO: reportes operativos/financieros, exportación PDF/Excel vía cola (CONTEXT §6).
export const reportsRoutes = Router();
reportsRoutes.use(authenticate);
