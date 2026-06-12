import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';
import { requirePermission } from '../../../shared/middlewares/permission';
import { validate } from '../../../shared/middlewares/validate';
import { customersController } from './customers.controller';
import { createCustomerSchema, updateCustomerSchema } from './customers.dto';

export const customersRoutes = Router();

customersRoutes.use(authenticate);

customersRoutes.get('/', requirePermission('commercial.read'), customersController.list);
customersRoutes.get('/:id', requirePermission('commercial.read'), customersController.getById);
customersRoutes.post('/', requirePermission('commercial.create'), validate(createCustomerSchema), customersController.create);
customersRoutes.patch('/:id', requirePermission('commercial.update'), validate(updateCustomerSchema), customersController.update);
customersRoutes.delete('/:id', requirePermission('commercial.delete'), customersController.deactivate);
