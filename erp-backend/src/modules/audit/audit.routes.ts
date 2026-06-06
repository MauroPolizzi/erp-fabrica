import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';

// TODO: consulta de logs de auditoría (solo lectura).
export const auditRoutes = Router();
auditRoutes.use(authenticate);
