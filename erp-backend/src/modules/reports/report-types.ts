import type { ZodTypeAny } from 'zod';
import { formatDate, now } from '../../shared/utils/date';

/**
 * Contrato de la capa de reportería.
 *
 * La idea es que agregar un reporte nuevo sea escribir UNA definición: de dónde salen
 * los datos, cómo se ven las columnas y qué va al pie. El formato del archivo
 * (`excel-writer`) y el transporte HTTP (`reports.controller`) no son asunto suyo.
 */

/** Fila de datos. Solo se escriben las claves declaradas en `columns`; el resto es auxiliar. */
export type ReportRow = Record<string, unknown>;

/** Cómo se formatea la celda en la planilla. */
export type ColumnFormat = 'text' | 'number' | 'quantity' | 'currency' | 'date';

export interface ReportColumn {
  header: string;
  /** Clave de la fila de la que sale el valor. */
  key: string;
  width?: number;
  format?: ColumnFormat;
}

/** Línea del bloque de totales, al pie de la planilla. */
export interface ReportTotal {
  label: string;
  value: string | number;
  format?: ColumnFormat;
}

export interface ReportDefinition<F, R extends ReportRow> {
  /** Segmento de URL: `GET /api/reports/<key>/excel`. */
  key: string;
  /** Título de la hoja y base del nombre del archivo. */
  title: string;
  /** Valida y normaliza el query string; su salida es el tipo `F`. */
  filtersSchema: ZodTypeAny;
  columns: ReportColumn[];
  /**
   * Único punto que consulta la base. Debe traer `limit + 1` filas: con esa fila de más
   * el servicio detecta que el rango se pasó del tope sin cargar el resultado completo.
   */
  fetch(filters: F, options: { limit: number }): Promise<R[]>;
  /** Líneas informativas sobre la tabla (período, filtros aplicados, aclaraciones). */
  header?(filters: F): string[] | Promise<string[]>;
  totals?(rows: R[], filters: F): ReportTotal[];
  /** Nombre del archivo sin extensión. Por defecto: slug del título + fecha de hoy. */
  filename?(filters: F): string;
}

/** Reporte ya resuelto, listo para volcarse a un archivo. */
export interface ReportPayload {
  title: string;
  filename: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  header: string[];
  totals: ReportTotal[];
}

/**
 * Definición con sus genéricos borrados, para poder guardar reportes de distinto tipo
 * en un mismo registro. `defineReport` concentra el único cast de filtros del módulo.
 */
export interface RegisteredReport {
  key: string;
  title: string;
  filtersSchema: ZodTypeAny;
  columns: ReportColumn[];
  resolve(
    filters: unknown,
    options: { limit: number },
  ): Promise<Pick<ReportPayload, 'rows' | 'header' | 'totals' | 'filename'>>;
}

export function defineReport<F, R extends ReportRow>(definition: ReportDefinition<F, R>): RegisteredReport {
  return {
    key: definition.key,
    title: definition.title,
    filtersSchema: definition.filtersSchema,
    columns: definition.columns,

    async resolve(rawFilters, options) {
      // Los filtros ya pasaron por `filtersSchema` en el servicio: acá recuperamos su tipo.
      const filters = rawFilters as F;
      const rows = await definition.fetch(filters, options);

      return {
        rows,
        header: (await definition.header?.(filters)) ?? [],
        totals: definition.totals?.(rows, filters) ?? [],
        filename: definition.filename?.(filters) ?? `${slug(definition.title)}_${formatDate(now(), 'YYYY-MM-DD')}`,
      };
    },
  };
}

/** Texto apto para nombre de archivo: sin acentos, espacios ni signos. */
function slug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
