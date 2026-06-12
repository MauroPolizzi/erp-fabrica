import { NextFunction, Request, Response } from 'express';
import { ok } from '../../../shared/utils/response';
import { categoriesService } from './categories.service';
import { listCategoryQuerySchema } from './categories.dto';

export const categoriesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = listCategoryQuerySchema.parse(req.query);
      res.json(ok(await categoriesService.list(type)));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoriesService.create(req.body, req.user?.id);
      res.status(201).json(ok(category));
    } catch (err) {
      next(err);
    }
  },
};
