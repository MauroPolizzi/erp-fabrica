import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';

// TODO: ABM de clientes (CONTEXT §6).
export const customersRoutes = Router();
customersRoutes.use(authenticate);
