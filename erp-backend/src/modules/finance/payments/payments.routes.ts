import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';

// TODO: caja de pagos a proveedores (CONTEXT §6).
export const paymentsRoutes = Router();
paymentsRoutes.use(authenticate);
