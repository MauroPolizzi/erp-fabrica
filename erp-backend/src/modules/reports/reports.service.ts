import { AppError } from '../../shared/utils/app-error';
import { salesByPeriodReport } from './definitions/sales-by-period';
import type { RegisteredReport, ReportPayload } from './report-types';

/**
 * Tope de filas por reporte. ExcelJS arma el workbook completo en memoria, así que un
 * rango desmedido hay que cortarlo antes de generarlo: las definiciones piden
 * `limit + 1` filas justamente para poder detectarlo sin traer todo el resultado.
 */
const MAX_REPORT_ROWS = 20_000;

/** Catálogo de reportes. Agregar uno nuevo = una definición más en esta lista. */
const REPORTS: RegisteredReport[] = [salesByPeriodReport];

const REPORT_BY_KEY = new Map(REPORTS.map((report) => [report.key, report]));

export const reportsService = {
  /**
   * Resuelve un reporte completo: valida los filtros contra el schema de su definición,
   * consulta los datos y devuelve todo listo para volcar a un archivo.
   *
   * Todo lo que puede fallar ocurre acá, ANTES de que el controller escriba un solo byte
   * en la respuesta: así un error sigue pudiendo contestarse como JSON.
   */
  async build(key: string, rawFilters: unknown): Promise<ReportPayload> {
    const report = REPORT_BY_KEY.get(key);
    if (!report) throw AppError.notFound(`No existe el reporte "${key}"`);

    // Un ZodError acá lo mapea el errorHandler a 400 con el detalle por campo.
    const filters = report.filtersSchema.parse(rawFilters);
    const { rows, header, totals, filename } = await report.resolve(filters, { limit: MAX_REPORT_ROWS });

    if (rows.length > MAX_REPORT_ROWS) {
      throw AppError.unprocessable(
        `El reporte supera las ${MAX_REPORT_ROWS.toLocaleString('es-AR')} filas. Achicá el rango de fechas.`,
      );
    }

    return { title: report.title, columns: report.columns, rows, header, totals, filename };
  },
};
