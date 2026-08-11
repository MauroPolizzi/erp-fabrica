import type { NextFunction, Request, Response } from 'express';
import { ok } from '../../shared/utils/response';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  async getSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await dashboardService.getSummary()));
    } catch (err) {
      next(err);
    }
  },
};
