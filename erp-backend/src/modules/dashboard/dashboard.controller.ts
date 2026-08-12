import type { NextFunction, Request, Response } from 'express';
import { ok } from '../../shared/utils/response';
import { salesSeriesSchema } from './dashboard.dto';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  async getSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await dashboardService.getSummary()));
    } catch (err) {
      next(err);
    }
  },

  async getSalesSeries(req: Request, res: Response, next: NextFunction) {
    try {
      // Zod valida y normaliza el query; el ZodError lo mapea el errorHandler a 400.
      const filters = salesSeriesSchema.parse(req.query);
      res.json(ok(await dashboardService.getSalesSeries(filters)));
    } catch (err) {
      next(err);
    }
  },
};
