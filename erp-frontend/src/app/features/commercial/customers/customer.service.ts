import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedResponse } from '../../../core/services/api.service';
import { Customer } from '../../../core/models/domain.model';

/** Payload de alta/edición de cliente (espejo de customers.dto del backend). */
export interface CustomerInput {
  name: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
}

/** Acceso a la API de clientes (`/api/commercial/customers`). Update por PATCH. */
@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly api = inject(ApiService);
  private readonly base = '/commercial/customers';

  list(page: number, limit: number, search?: string): Observable<PagedResponse<Customer>> {
    return this.api.getPaged<Customer>(this.base, { page, limit, search: search ?? '' });
  }

  getById(id: string): Observable<Customer> {
    return this.api.get<Customer>(`${this.base}/${id}`);
  }

  create(dto: CustomerInput): Observable<Customer> {
    return this.api.post<Customer>(this.base, dto);
  }

  update(id: string, dto: CustomerInput): Observable<Customer> {
    return this.api.patch<Customer>(`${this.base}/${id}`, dto);
  }

  deactivate(id: string): Observable<Customer> {
    return this.api.delete<Customer>(`${this.base}/${id}`);
  }
}
