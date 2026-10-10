import type { NextFunction, Request, Response } from 'express';
import { ok } from '../../shared/utils/response';
import { authService } from './auth.service';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const tokens = await authService.login(req.body);
      res.json(ok(tokens));
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const tokens = await authService.refresh(req.body.refreshToken);
      res.json(ok(tokens));
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response) {
    res.json(ok(req.user));
  },

  /**
   * Respuesta única e incondicional: el mismo 200 para un email registrado, uno
   * inexistente y uno de un usuario dado de baja. Es lo que impide usar el endpoint
   * para enumerar cuentas.
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      res.json(
        ok({
          message:
            'Si el email está registrado, vas a recibir un mensaje con las instrucciones para restablecer tu contraseña.',
        }),
      );
    } catch (err) {
      next(err);
    }
  },

  async validateResetToken(req: Request, res: Response, next: NextFunction) {
    try {
      const valid = await authService.validateResetToken(String(req.params.token));
      res.json(ok({ valid }));
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.json(ok({ message: 'Tu contraseña fue actualizada. Ya podés iniciar sesión.' }));
    } catch (err) {
      next(err);
    }
  },
};
