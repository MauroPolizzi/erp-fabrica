import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';
import { requirePermission } from '../../shared/middlewares/permission';
import { validate } from '../../shared/middlewares/validate';
import { usersController } from './users.controller';
import { createUserSchema, updateUserSchema } from './users.dto';

export const usersRoutes = Router();

usersRoutes.use(authenticate);

usersRoutes.get('/', requirePermission('users.read'), usersController.list);
usersRoutes.get('/:id', requirePermission('users.read'), usersController.getById);
usersRoutes.post('/', requirePermission('users.create'), validate(createUserSchema), usersController.create);
usersRoutes.patch('/:id', requirePermission('users.update'), validate(updateUserSchema), usersController.update);
usersRoutes.delete('/:id', requirePermission('users.delete'), usersController.deactivate);
