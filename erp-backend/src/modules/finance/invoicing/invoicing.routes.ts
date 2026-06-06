import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';

// TODO: comprobantes A/B/C/Recibo + soporte CAE (factura electrónica) (CONTEXT §6).
export const invoicingRoutes = Router();
invoicingRoutes.use(authenticate);
