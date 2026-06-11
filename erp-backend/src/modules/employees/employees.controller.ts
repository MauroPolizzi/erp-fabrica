import { NextFunction, Request, Response } from 'express';
import { getPagination } from '../../shared/utils/pagination';
import { employeesService } from './employees.service';
import { ok } from '../../shared/utils/response';

export const employeesController = {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const pagination = getPagination(req.query);
            const { data, meta } = await employeesService.list(pagination, req.query.search as string | undefined);
            res.json(ok(data, meta));
        } catch (err) {
            next(err);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            res.json(ok(await employeesService.getById(String(req.params.id))));
        } catch (err) {
            next(err);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const employee = await employeesService.create(req.body, req.user?.id);
            res.status(201).json(ok(employee));
        } catch (err) {
            next(err);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            res.json(ok(await employeesService.update(String(req.params.id), req.body, req.user?.id)));
        } catch (err) {
            next(err);
        }
    },

    async deactivate(req: Request, res: Response, next: NextFunction) {
        try {
            res.json(ok(await employeesService.deactivate(String(req.params.id), req.user?.id)));
        } catch (err) {
            next(err);
        }
    },
};