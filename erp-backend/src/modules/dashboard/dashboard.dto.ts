import { z } from 'zod';
import { parseDateRange } from '../../shared/utils/date';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Granularidad de la serie. Cada bucket se identifica por su fecha de inicio. */
export const SALES_SERIES_GROUP_BY = ['day', 'week', 'month'] as const;
export type SalesSeriesGroupBy = (typeof SALES_SERIES_GROUP_BY)[number];

/** Rango por defecto según la granularidad (presets del dashboard). */
const DEFAULT_BUCKETS: Record<SalesSeriesGroupBy, number> = { day: 30, week: 12, month: 12 };

/** Tope de puntos por granularidad: acota la consulta y el tamaño de la respuesta. */
export const MAX_BUCKETS: Record<SalesSeriesGroupBy, number> = { day: 366, week: 120, month: 60 };

export const salesSeriesSchema = z
  .object({
    from: z.string().regex(DATE_PATTERN, 'Formato de fecha esperado: YYYY-MM-DD').optional(),
    to: z.string().regex(DATE_PATTERN, 'Formato de fecha esperado: YYYY-MM-DD').optional(),
    groupBy: z.enum(SALES_SERIES_GROUP_BY).default('day'),
  })
  .refine((filters) => !filters.from || !filters.to || filters.from <= filters.to, {
    message: 'La fecha "desde" no puede ser posterior a "hasta"',
    path: ['from'],
  })
  .transform((filters) => ({
    groupBy: filters.groupBy,
    ...parseDateRange(filters.from, filters.to, {
      defaultCount: DEFAULT_BUCKETS[filters.groupBy],
      defaultUnit: filters.groupBy,
    }),
  }));

export type SalesSeriesFilters = z.infer<typeof salesSeriesSchema>;
