import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';

// TODO: stock de materias primas + costo promedio ponderado (CONTEXT §6, §7).
export const rawMaterialsRoutes = Router();
rawMaterialsRoutes.use(authenticate);
