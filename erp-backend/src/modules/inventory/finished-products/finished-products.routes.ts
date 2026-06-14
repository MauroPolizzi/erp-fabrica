import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';
import { requirePermission } from '../../../shared/middlewares/permission';
import { validate } from '../../../shared/middlewares/validate';
import { finishedProductsController } from './finished-products.controller';
import { createFinishedProductSchema, createStockMovementSchema, updateFinishedProductSchema } from './finished-products.dto';

export const finishedProductsRoutes = Router();

finishedProductsRoutes.use(authenticate);

finishedProductsRoutes.get('/', requirePermission('inventory.read'), finishedProductsController.list);
finishedProductsRoutes.get('/:id', requirePermission('inventory.read'), finishedProductsController.getById);
finishedProductsRoutes.post('/', requirePermission('inventory.create'), validate(createFinishedProductSchema), finishedProductsController.create);
finishedProductsRoutes.patch('/:id', requirePermission('inventory.update'), validate(updateFinishedProductSchema), finishedProductsController.update);
finishedProductsRoutes.delete('/:id', requirePermission('inventory.delete'), finishedProductsController.deactivate);

// Movimientos de stock (sub-recurso del producto)
finishedProductsRoutes.get('/:id/movements', requirePermission('inventory.read'), finishedProductsController.listMovements);
finishedProductsRoutes.post('/:id/movements', requirePermission('inventory.update'), validate(createStockMovementSchema), finishedProductsController.createMovement);
