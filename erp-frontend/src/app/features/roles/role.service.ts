import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Role } from '../../core/models/domain.model';

/**
 * Acceso de solo lectura a roles (`/api/roles`). La asignación de permisos a roles
 * se define en el seed del backend (RBAC — ROADMAP §8.2), no desde la UI.
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly api = inject(ApiService);
  private readonly base = '/roles';

  list(): Observable<Role[]> {
    return this.api.get<Role[]>(this.base);
  }

  getById(id: string): Observable<Role> {
    return this.api.get<Role>(`${this.base}/${id}`);
  }
}
