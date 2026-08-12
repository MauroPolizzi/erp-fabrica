import { Injectable, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { saveAs } from 'file-saver';
import { ApiService } from '../../core/services/api.service';

/** Filtros del reporte de ventas (espejo de `sales-by-period.ts` del backend). */
export interface SalesReportFilters {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  customerId?: string;
}

/** Qué trajo la descarga: filas del reporte y nombre con el que se guardó el archivo. */
export interface ReportDownload {
  rows: number;
  filename: string;
}

/**
 * Descarga de reportes (`/api/reports`). Agregar un reporte nuevo es sumar un método
 * público acá: la mecánica de descarga (blob, nombre de archivo, guardado) ya está resuelta.
 */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ApiService);
  private readonly base = '/reports';

  downloadSalesByPeriod(filters: SalesReportFilters = {}): Observable<ReportDownload> {
    // ApiService omite los params vacíos, así que los filtros sin valor no se envían.
    return this.downloadExcel('sales-by-period', {
      from: filters.from ?? '',
      to: filters.to ?? '',
      customerId: filters.customerId ?? '',
    });
  }

  private downloadExcel(key: string, params: Record<string, string>): Observable<ReportDownload> {
    return this.api.getBlob(`${this.base}/${key}/excel`, params).pipe(
      map((res) => {
        const filename = filenameFrom(res, key);
        saveAs(res.body ?? new Blob(), filename);
        return { rows: Number(res.headers.get('X-Report-Rows') ?? 0), filename };
      }),
    );
  }
}

/**
 * Nombre del archivo tal como lo mandó el backend. Si la cabecera no llega (por ejemplo
 * detrás de un proxy que no la expone), se arma uno con la fecha del día.
 */
function filenameFrom(res: HttpResponse<Blob>, key: string): string {
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return match ? match[1] : `${key}_${new Date().toISOString().slice(0, 10)}.xlsx`;
}
