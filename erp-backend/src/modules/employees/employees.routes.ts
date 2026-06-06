import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware';

// TODO: implementar controller/service/dto siguiendo el patrón de `users`.
export const employeesRoutes = Router();
employeesRoutes.use(authenticate);
