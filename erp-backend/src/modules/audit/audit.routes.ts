import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission';
import { auditController } from './audit.controller';

// Consulta de logs de auditoría (solo lectura). La escritura la hace writeAuditLog
// desde los services. Protegido con audit.read (hoy solo Administración vía admin.*).
export const auditRoutes = Router();

auditRoutes.use(authenticate);

// `/entities` antes de `/:id` para que no lo capture la ruta paramétrica.
auditRoutes.get('/', requirePermission('audit.read'), auditController.list);
auditRoutes.get('/entities', requirePermission('audit.read'), auditController.entities);
auditRoutes.get('/:id', requirePermission('audit.read'), auditController.getById);
