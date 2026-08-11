import { NextFunction, Request, Response } from 'express';
import { SaleStatus } from '@prisma/client';
import dayjs from 'dayjs';
import { getPagination } from '../../../shared/utils/pagination';
import { ok } from '../../../shared/utils/response';
import { salesService, type SalesListFilters } from './sales.service';

/** Valida que el string sea un SaleStatus conocido; si no, lo ignora. */
function parseSaleStatus(value: unknown): SaleStatus | undefined {
  return typeof value === 'string' && (Object.values(SaleStatus) as string[]).includes(value)
    ? (value as SaleStatus)
    : undefined;
}

/** Parsea una fecha YYYY-MM-DD al inicio/fin del día; ignora valores inválidos. */
function parseDate(value: unknown, edge: 'start' | 'end'): Date | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const d = dayjs(value);
  if (!d.isValid()) return undefined;
  return (edge === 'start' ? d.startOf('day') : d.endOf('day')).toDate();
}

export const salesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPagination(req.query);
      const search = req.query.search;
      const filters: SalesListFilters = {
        search: typeof search === 'string' && search.trim() ? search.trim() : undefined,
        status: parseSaleStatus(req.query.status),
        from: parseDate(req.query.from, 'start'),
        to: parseDate(req.query.to, 'end'),
      };
      const { data, meta } = await salesService.list(pagination, filters);
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

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await salesService.cancel(String(req.params.id), req.user?.id)));
    } catch (err) {
      next(err);
    }
  },
};
