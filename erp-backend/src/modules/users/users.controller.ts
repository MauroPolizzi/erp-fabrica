import type { NextFunction, Request, Response } from 'express';
import { ok } from '../../shared/utils/response';
import { getPagination } from '../../shared/utils/pagination';
import { usersService } from './users.service';

export const usersController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPagination(req.query);
      const { data, meta } = await usersService.list(pagination, req.query.search as string | undefined);
      res.json(ok(data, meta));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await usersService.getById(String(req.params.id))));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.create(req.body, req.user?.id);
      res.status(201).json(ok(user));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await usersService.update(String(req.params.id), req.body, req.user?.id)));
    } catch (err) {
      next(err);
    }
  },

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await usersService.deactivate(String(req.params.id), req.user?.id)));
    } catch (err) {
      next(err);
    }
  },
};
