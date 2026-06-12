import { NextFunction, Request, Response } from 'express';
import { getPagination } from '../../../shared/utils/pagination';
import { ok } from '../../../shared/utils/response';
import { finishedProductsService } from './finished-products.service';

export const finishedProductsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPagination(req.query);
      const { data, meta } = await finishedProductsService.list(pagination, req.query.search as string | undefined);
      res.json(ok(data, meta));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await finishedProductsService.getById(String(req.params.id))));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await finishedProductsService.create(req.body, req.user?.id);
      res.status(201).json(ok(product));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await finishedProductsService.update(String(req.params.id), req.body, req.user?.id)));
    } catch (err) {
      next(err);
    }
  },

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await finishedProductsService.deactivate(String(req.params.id), req.user?.id)));
    } catch (err) {
      next(err);
    }
  },
};
