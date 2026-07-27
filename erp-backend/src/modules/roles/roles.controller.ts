import type { NextFunction, Request, Response } from 'express';
import { ok } from '../../shared/utils/response';
import { rolesService } from './roles.service';

export const rolesController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await rolesService.list()));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await rolesService.getById(String(req.params.id))));
    } catch (err) {
      next(err);
    }
  },
};
