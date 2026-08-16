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

export type SalesSeriesGroupBy = 'day' | 'week' | 'month';

/** Punto de la serie. `label` es la fecha de inicio del bucket (YYYY-MM-DD). */
export interface SalesSeriesPoint {
  label: string;
  total: string; // Decimal como string
  count: number;
}

/** Serie temporal de ventas confirmadas. Incluye los buckets vacíos (total "0.00"). */
export interface SalesSeries {
  groupBy: SalesSeriesGroupBy;
  from: string;
  to: string;
  points: SalesSeriesPoint[];
}

/** Métricas de gestión para la home (`/api/dashboard`). */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  getSummary(): Observable<DashboardSummary> {
    return this.api.get<DashboardSummary>('/dashboard');
  }

  /** El backend resuelve el rango por defecto según la granularidad (30 días / 12 semanas / 12 meses). */
  getSalesSeries(groupBy: SalesSeriesGroupBy): Observable<SalesSeries> {
    return this.api.get<SalesSeries>('/dashboard/sales-series', { groupBy });
  }
}
