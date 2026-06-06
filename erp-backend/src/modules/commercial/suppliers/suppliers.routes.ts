import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';

// TODO: ABM de proveedores (CONTEXT §6).
export const suppliersRoutes = Router();
suppliersRoutes.use(authenticate);
