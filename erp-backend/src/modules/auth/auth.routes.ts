import { Router } from 'express';
import { validate } from '../../shared/middlewares/validate';
import { authController } from './auth.controller';
import { authenticate } from './auth.middleware';
import { loginSchema, refreshSchema } from './auth.dto';

export const authRoutes = Router();

authRoutes.post('/login', validate(loginSchema), authController.login);
authRoutes.post('/refresh', validate(refreshSchema), authController.refresh);
authRoutes.get('/me', authenticate, authController.me);
