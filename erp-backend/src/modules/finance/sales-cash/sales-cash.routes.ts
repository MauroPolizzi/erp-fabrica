import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';

// TODO: caja de ventas — movimientos de ingreso (CONTEXT §6).
export const salesCashRoutes = Router();
salesCashRoutes.use(authenticate);
