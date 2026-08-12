import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission';
import { reportsController } from './reports.controller';

/**
 * Reportería. La clave del reporte va en la URL y se resuelve contra el catálogo de
 * `reports.service`, así que agregar un reporte nuevo no toca este archivo.
 */
export const reportsRoutes = Router();

reportsRoutes.use(authenticate);

reportsRoutes.get('/:key/excel', requirePermission('reports.read'), reportsController.excel);
