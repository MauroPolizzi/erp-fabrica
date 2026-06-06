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
};
