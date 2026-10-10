import type { NextFunction, Request, Response } from 'express';
import { parseDay } from '../../../shared/utils/date';
import { ok } from '../../../shared/utils/response';
import { getPagination } from '../../../shared/utils/pagination';
import { salesCashService, type CashMovementFilters } from './sales-cash.service';

export const salesCashController = {
  async getRegister(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await salesCashService.getRegister()));
    } catch (err) {
      next(err);
    }
  },

  async listMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPagination(req.query);
      const filters: CashMovementFilters = {
        from: parseDay(req.query.from, 'start'),
        to: parseDay(req.query.to, 'end'),
      };
      const { data, meta } = await salesCashService.listMovements(pagination, filters);
      res.json(ok(data, meta));
    } catch (err) {
      next(err);
    }
  },
};
