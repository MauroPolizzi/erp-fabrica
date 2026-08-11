import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/app-error';
import { buildMeta, type PaginationParams } from '../../shared/utils/pagination';

/** Filtros del listado de auditoría (todos opcionales). `entity`/`action` son match exacto. */
export interface AuditListFilters {
  entity?: string;
  action?: string;
  from?: Date;
  to?: Date;
}

// El listado NO trae oldValues/newValues (pueden ser grandes): eso va en el detalle.
const listSelect = {
  id: true,
  action: true,
  entity: true,
  entityId: true,
  createdAt: true,
  user: { select: { id: true, fullName: true } },
} as const;

/**
 * Auditoría de solo lectura. Los asientos los escribe `writeAuditLog` desde los
 * services en operaciones críticas (CREATE/UPDATE/DELETE). Aquí solo se consultan.
 */
export const auditService = {
  async list(params: PaginationParams, filters: AuditListFilters = {}) {
    const where: Prisma.AuditLogWhereInput = {};
    if (filters.entity) where.entity = filters.entity;
    if (filters.action) where.action = filters.action;
    if (filters.from || filters.to) {
      where.createdAt = {
        ...(filters.from ? { gte: filters.from } : {}),
        ...(filters.to ? { lte: filters.to } : {}),
      };
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        select: listSelect,
        skip: params.skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { data, meta: buildMeta(total, params) };
  },

  async getById(id: string) {
    const log = await prisma.auditLog.findUnique({
      where: { id },
      select: { ...listSelect, oldValues: true, newValues: true },
    });
    if (!log) throw AppError.notFound('Registro de auditoría no encontrado');
    return log;
  },

  /** Entidades distintas presentes en los logs, para poblar el filtro del frontend. */
  async entities() {
    const rows = await prisma.auditLog.findMany({
      distinct: ['entity'],
      select: { entity: true },
      orderBy: { entity: 'asc' },
    });
    return rows.map((r) => r.entity);
  },
};
