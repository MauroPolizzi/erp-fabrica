import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';

// TODO: stock de productos terminados y movimientos (CONTEXT §6, §7).
export const finishedProductsRoutes = Router();
finishedProductsRoutes.use(authenticate);
