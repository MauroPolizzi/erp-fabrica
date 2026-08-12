import type { NextFunction, Request, Response } from 'express';
import { writeReportWorkbook } from './excel-writer';
import { reportsService } from './reports.service';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export const reportsController = {
  /**
   * Descarga de un reporte en Excel.
   *
   * El orden importa: primero se resuelven filtros y datos (si algo falla, el
   * errorHandler todavía puede responder JSON) y recién después se escriben los headers
   * y se streamea el binario. Invertirlo dejaría al cliente con un archivo corrupto en
   * lugar de un mensaje de error.
   */
  async excel(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = await reportsService.build(String(req.params.key), req.query);

      res.setHeader('Content-Type', XLSX_MIME);
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename(payload.filename)}"`);
      // El frontend lo lee para avisar "no hay datos en el período" sin abrir el archivo.
      res.setHeader('X-Report-Rows', String(payload.rows.length));

      await writeReportWorkbook(res, payload);
      // ExcelJS cierra el stream al finalizar el zip; el guard evita un doble end().
      if (!res.writableEnded) res.end();
    } catch (err) {
      next(err);
    }
  },
};

/** Nombre seguro para la cabecera Content-Disposition (sin comillas, acentos ni espacios). */
function safeFilename(name: string): string {
  return `${name.replace(/[^A-Za-z0-9._-]/g, '_')}.xlsx`;
}
