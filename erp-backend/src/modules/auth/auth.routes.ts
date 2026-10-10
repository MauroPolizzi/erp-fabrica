import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../../config/environment';
import { validate } from '../../shared/middlewares/validate';
import { authController } from './auth.controller';
import { authenticate } from './auth.middleware';
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  resetPasswordSchema,
} from './auth.dto';

/**
 * Límite propio para los endpoints de recuperación: el global de app.ts (1000 por
 * ventana) no acota el abuso de un endpoint público que dispara mails y genera tokens.
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // La suite golpea estos endpoints muchas veces desde la misma IP; el 429 real se
  // verifica a mano con demo.http (§R1).
  limit: env.NODE_ENV === 'test' ? 1000 : 5,
  message: { error: 'Demasiados intentos. Esperá unos minutos y volvé a probar.' },
});

export const authRoutes = Router();

authRoutes.post('/login', validate(loginSchema), authController.login);
authRoutes.post('/refresh', validate(refreshSchema), authController.refresh);
authRoutes.get('/me', authenticate, authController.me);

// Recuperación de contraseña (público, sin authenticate).
authRoutes.post(
  '/forgot-password',
  passwordResetLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
authRoutes.get(
  '/reset-password/:token/validate',
  passwordResetLimiter,
  authController.validateResetToken,
);
authRoutes.post(
  '/reset-password',
  passwordResetLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);
