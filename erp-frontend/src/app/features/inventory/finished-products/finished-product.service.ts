import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedResponse } from '../../../core/services/api.service';
import { FinishedProduct, FinishedProductMovement } from '../../../core/models/domain.model';

/** Payload de alta/edición de producto terminado (sin currentStock). */
export interface FinishedProductInput {
  sku: string;
  name: string;
  categoryId: string;
  unit: string;
  salePrice: number;
}

/** Payload de movimiento de stock. OUT lo genera solo la venta (F4). */
export interface StockMovementInput {
  type: 'IN' | 'ADJUST';
  quantity: number;
  reference?: string;
}

/** Respuesta del alta de movimiento: el movimiento creado + el stock resultante. */
export interface StockMovementResult {
  movement: FinishedProductMovement;
  currentStock: string;
}

/** Acceso a la API de productos terminados (`/api/inventory/finished-products`). Update por PATCH. */
@Injectable({ providedIn: 'root' })
export class FinishedProductService {
  private readonly api = inject(ApiService);
  private readonly base = '/inventory/finished-products';

  list(page: number, limit: number, search?: string): Observable<PagedResponse<FinishedProduct>> {
    return this.api.getPaged<FinishedProduct>(this.base, { page, limit, search: search ?? '' });
  }

  getById(id: string): Observable<FinishedProduct> {
    return this.api.get<FinishedProduct>(`${this.base}/${id}`);
  }

  create(dto: FinishedProductInput): Observable<FinishedProduct> {
    return this.api.post<FinishedProduct>(this.base, dto);
  }

  update(id: string, dto: FinishedProductInput): Observable<FinishedProduct> {
    return this.api.patch<FinishedProduct>(`${this.base}/${id}`, dto);
  }

  deactivate(id: string): Observable<FinishedProduct> {
    return this.api.delete<FinishedProduct>(`${this.base}/${id}`);
  }

  addMovement(id: string, dto: StockMovementInput): Observable<StockMovementResult> {
    return this.api.post<StockMovementResult>(`${this.base}/${id}/movements`, dto);
  }

  listMovements(id: string, page: number, limit: number): Observable<PagedResponse<FinishedProductMovement>> {
    return this.api.getPaged<FinishedProductMovement>(`${this.base}/${id}/movements`, { page, limit });
  }
}
