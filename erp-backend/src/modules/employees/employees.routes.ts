import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission';
import { validate } from '../../shared/middlewares/validate';
import { employeesController } from './employees.controller';
import { createEmployeesSchema, updateEmployeesSchema } from './employees.dto';

export const employeesRoutes = Router();

employeesRoutes.use(authenticate);

employeesRoutes.get('/', requirePermission('employees.read'), employeesController.list);
employeesRoutes.get('/:id', requirePermission('employees.read'), employeesController.getById);
employeesRoutes.post('/', requirePermission('employees.create'), validate(createEmployeesSchema), employeesController.create);
employeesRoutes.patch('/:id', requirePermission('employees.update'), validate(updateEmployeesSchema), employeesController.update);
employeesRoutes.delete('/:id', requirePermission('employees.delete'), employeesController.deactivate);
