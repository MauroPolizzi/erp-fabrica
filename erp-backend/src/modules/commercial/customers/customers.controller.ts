import { NextFunction, Request, Response } from 'express';
import { getPagination } from '../../../shared/utils/pagination';
import { ok } from '../../../shared/utils/response';
import { customersService } from './customers.service';

export const customersController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPagination(req.query);
      const { data, meta } = await customersService.list(pagination, req.query.search as string | undefined);
      res.json(ok(data, meta));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await customersService.getById(String(req.params.id))));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await customersService.create(req.body, req.user?.id);
      res.status(201).json(ok(customer));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await customersService.update(String(req.params.id), req.body, req.user?.id)));
    } catch (err) {
      next(err);
    }
  },

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await customersService.deactivate(String(req.params.id), req.user?.id)));
    } catch (err) {
      next(err);
    }
  },
};
