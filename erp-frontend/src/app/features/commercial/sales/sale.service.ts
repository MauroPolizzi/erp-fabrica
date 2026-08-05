import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedResponse } from '../../../core/services/api.service';
import { PaymentMethod, Sale } from '../../../core/models/domain.model';

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

  list(page: number, limit: number): Observable<PagedResponse<Sale>> {
    return this.api.getPaged<Sale>(this.base, { page, limit });
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
