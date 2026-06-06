/** Sobres de respuesta uniformes para la API. */

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ok<T>(data: T, meta?: ApiMeta) {
  return meta ? { data, meta } : { data };
}

export function paginated<T>(data: T[], meta: ApiMeta) {
  return { data, meta };
}
