import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';
import { requirePermission } from '../../../shared/middlewares/permission';
import { validate } from '../../../shared/middlewares/validate';
import { salesController } from './sales.controller';
import { createSaleSchema } from './sales.dto';

export const salesRoutes = Router();

salesRoutes.use(authenticate);

salesRoutes.get('/', requirePermission('commercial.read'), salesController.list);
salesRoutes.get('/:id', requirePermission('commercial.read'), salesController.getById);
salesRoutes.post('/', requirePermission('commercial.create'), validate(createSaleSchema), salesController.create);
