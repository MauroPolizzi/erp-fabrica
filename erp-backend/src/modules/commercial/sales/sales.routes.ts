import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';

// TODO: ventas + detalle, descuento de stock PT en $transaction (CONTEXT §6, §7).
export const salesRoutes = Router();
salesRoutes.use(authenticate);
