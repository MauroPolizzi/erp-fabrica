import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface SalesMetric {
  total: string; // Decimal como string
  count: number;
}

export interface TopCustomer {
  customerId: string;
  name: string;
  total: string;
}

export interface LowStockProduct {
  id: string;
  sku: string;
  name: string;
  unit: string;
  currentStock: string;
}

export interface DashboardSummary {
  salesMonth: SalesMetric;
  salesToday: SalesMetric;
  activeProducts: number;
  activeCustomers: number;
  topCustomers: TopCustomer[];
  lowStock: LowStockProduct[];
}

/** Métricas de gestión para la home (`/api/dashboard`). */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  getSummary(): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>('/dashboard');
  }
}
