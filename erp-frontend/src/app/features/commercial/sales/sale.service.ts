import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedResponse } from '../../../core/services/api.service';
import { PaymentMethod, Sale, SaleStatus } from '../../../core/models/domain.model';

/** Filtros del listado de ventas (todos opcionales). `search` = nombre del cliente. */
export interface SaleListFilters {
  search?: string;
  status?: SaleStatus;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}

/** Ítem de la venta a enviar al backend (la cantidad va como número). */
export interface SaleItemInput {
  finishedProductId: string;
  quantity: number;
}

/** Payload de alta de venta (espejo de createSaleSchema del backend). */
export interface SaleInput {
  customerId: string;
  paymentMethod: PaymentMethod;
  items: SaleItemInput[];
}

/** Opciones de medio de pago (enum PaymentMethod del backend) con etiqueta en español. */
export const PAYMENT_METHODS: { label: string; value: PaymentMethod }[] = [
  { label: 'Efectivo', value: 'CASH' },
  { label: 'Transferencia', value: 'TRANSFER' },
  { label: 'Tarjeta', value: 'CARD' },
  { label: 'Cheque', value: 'CHECK' },
  { label: 'Cuenta corriente', value: 'ACCOUNT' },
];

/** Etiqueta legible de un medio de pago. */
export function paymentMethodLabel(value: PaymentMethod): string {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

/** Acceso a la API de ventas (`/api/commercial/sales`). Sin update/delete. */
@Injectable({ providedIn: 'root' })
export class SaleService {
  private readonly api = inject(ApiService);
  private readonly base = '/commercial/sales';

  list(page: number, limit: number, filters: SaleListFilters = {}): Observable<PagedResponse<Sale>> {
    // ApiService omite params vacíos, así que los filtros sin valor no se envían.
    return this.api.getPaged<Sale>(this.base, {
      page,
      limit,
      search: filters.search ?? '',
      status: filters.status ?? '',
      from: filters.from ?? '',
      to: filters.to ?? '',
    });
  }

  getById(id: string): Observable<Sale> {
    return this.api.get<Sale>(`${this.base}/${id}`);
  }

  create(dto: SaleInput): Observable<Sale> {
    return this.api.post<Sale>(this.base, dto);
  }

  /** Anula una venta confirmada; el backend repone el stock. */
  cancel(id: string): Observable<Sale> {
    return this.api.patch<Sale>(`${this.base}/${id}/cancel`, {});
  }
}
