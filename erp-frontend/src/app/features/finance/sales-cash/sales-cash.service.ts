import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedResponse } from '../../../core/services/api.service';
import { CashMovement, CashRegister } from '../../../core/models/domain.model';

/**
 * Caja de ventas de solo lectura (`/api/finance/sales-cash`). El saldo y los movimientos
 * los genera el backend a partir de ventas y anulaciones; no se cargan manualmente.
 */
@Injectable({ providedIn: 'root' })
export class SalesCashService {
  private readonly api = inject(ApiService);
  private readonly base = '/finance/sales-cash';

  getRegister(): Observable<CashRegister> {
    return this.api.get<CashRegister>(this.base);
  }

  /** `from`/`to` en formato YYYY-MM-DD; acotan el listado, no el saldo de la caja. */
  listMovements(
    page: number,
    limit: number,
    filters: { from?: string; to?: string } = {},
  ): Observable<PagedResponse<CashMovement>> {
    return this.api.getPaged<CashMovement>(`${this.base}/movements`, {
      page,
      limit,
      from: filters.from ?? '',
      to: filters.to ?? '',
    });
  }
}
