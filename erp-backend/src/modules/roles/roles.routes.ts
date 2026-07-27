import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission';
import { rolesController } from './roles.controller';

// Solo lectura: la asignación de permisos a roles se hace por seed/migración.
// Se protege con users.read porque la gestión de roles acompaña a la de usuarios.
export const rolesRoutes = Router();

rolesRoutes.use(authenticate);

rolesRoutes.get('/', requirePermission('users.read'), rolesController.list);
rolesRoutes.get('/:id', requirePermission('users.read'), rolesController.getById);
