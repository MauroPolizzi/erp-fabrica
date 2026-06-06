import { env } from '../../config/environment';
import type { ApiMeta } from './response';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/** Normaliza query params de paginación respetando los límites configurados. */
export function getPagination(query: { page?: unknown; limit?: unknown }): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const requested = Number(query.limit) || env.DEFAULT_PAGINATION_LIMIT;
  const limit = Math.min(Math.max(1, requested), env.MAX_PAGINATION_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}

export function buildMeta(total: number, params: PaginationParams): ApiMeta {
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages: Math.ceil(total / params.limit) || 1,
  };
}
