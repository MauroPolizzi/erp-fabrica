import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import { dashboardController } from './dashboard.controller';

// Home de todos los roles: solo requiere autenticación (sin permiso específico),
// para no dejar a Ventas/Stock/Producción sin su pantalla de inicio.
export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);

dashboardRoutes.get('/', dashboardController.getSummary);
dashboardRoutes.get('/sales-series', dashboardController.getSalesSeries);
