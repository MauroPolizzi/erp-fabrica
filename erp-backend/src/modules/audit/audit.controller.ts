import type { NextFunction, Request, Response } from 'express';
import dayjs from 'dayjs';
import { getPagination } from '../../shared/utils/pagination';
import { ok } from '../../shared/utils/response';
import { auditService, type AuditListFilters } from './audit.service';

const KNOWN_ACTIONS = ['CREATE', 'UPDATE', 'DELETE'];

function parseAction(value: unknown): string | undefined {
  return typeof value === 'string' && KNOWN_ACTIONS.includes(value) ? value : undefined;
}

function parseDate(value: unknown, edge: 'start' | 'end'): Date | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const d = dayjs(value);
  if (!d.isValid()) return undefined;
  return (edge === 'start' ? d.startOf('day') : d.endOf('day')).toDate();
}

export const auditController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = getPagination(req.query);
      const entity = req.query.entity;
      const filters: AuditListFilters = {
        entity: typeof entity === 'string' && entity.trim() ? entity.trim() : undefined,
        action: parseAction(req.query.action),
        from: parseDate(req.query.from, 'start'),
        to: parseDate(req.query.to, 'end'),
      };
      const { data, meta } = await auditService.list(pagination, filters);
      res.json(ok(data, meta));
    } catch (err) {
      next(err);
    }
  },

  async entities(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await auditService.entities()));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(ok(await auditService.getById(String(req.params.id))));
    } catch (err) {
      next(err);
    }
  },
};
