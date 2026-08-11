import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedResponse } from '../../core/services/api.service';
import { AuditLog } from '../../core/models/domain.model';

/** Filtros del listado de auditoría (todos opcionales). `entity`/`action` = match exacto. */
export interface AuditListFilters {
  entity?: string;
  action?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}

/** Acceso de solo lectura a la auditoría (`/api/audit`). */
@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly api = inject(ApiService);
  private readonly base = '/audit';

  list(page: number, limit: number, filters: AuditListFilters = {}): Observable<PagedResponse<AuditLog>> {
    return this.api.getPaged<AuditLog>(this.base, {
      page,
      limit,
      entity: filters.entity ?? '',
      action: filters.action ?? '',
      from: filters.from ?? '',
      to: filters.to ?? '',
    });
  }

  getById(id: string): Observable<AuditLog> {
    return this.api.get<AuditLog>(`${this.base}/${id}`);
  }

  /** Entidades distintas presentes en los logs, para el filtro. */
  entities(): Observable<string[]> {
    return this.api.get<string[]>(`${this.base}/entities`);
  }
}
