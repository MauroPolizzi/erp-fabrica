import { NextFunction, Request, Response } from 'express';
import { getPagination } from '../../../shared/utils/pagination';
import { ok } from '../../../shared/utils/response';
import { salesService } from './sales.service';

export const salesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPagination(req.query);
      const { data, meta } = await salesService.list(pagination);
      res.json(ok(data, meta));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await salesService.getById(String(req.params.id))));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const sale = await salesService.create(req.body, req.user?.id);
      res.status(201).json(ok(sale));
    } catch (err) {
      next(err);
    }
  },
};
