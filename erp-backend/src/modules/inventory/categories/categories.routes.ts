import { Router } from 'express';
import { authenticate } from '../../auth/auth.middleware';
import { requirePermission } from '../../../shared/middlewares/permission';
import { validate } from '../../../shared/middlewares/validate';
import { categoriesController } from './categories.controller';
import { createCategorySchema } from './categories.dto';

export const categoriesRoutes = Router();

categoriesRoutes.use(authenticate);

categoriesRoutes.get('/', requirePermission('inventory.read'), categoriesController.list);
categoriesRoutes.post('/', requirePermission('inventory.create'), validate(createCategorySchema), categoriesController.create);
