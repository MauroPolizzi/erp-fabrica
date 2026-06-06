import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';

// TODO: registro de producción: descuenta MP y suma PT en $transaction (CONTEXT §7).
export const productionRoutes = Router();
productionRoutes.use(authenticate);
