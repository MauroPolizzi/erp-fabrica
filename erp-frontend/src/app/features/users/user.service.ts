import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedResponse } from '../../core/services/api.service';
import { User } from '../../core/models/domain.model';

/** Alta de usuario (espejo de createUserSchema del backend). */
export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  roleId: string;
}

/** Edición de usuario (espejo de updateUserSchema: email/password no se modifican aquí). */
export interface UpdateUserInput {
  fullName?: string;
  roleId?: string;
  isActive?: boolean;
}

/** Acceso a la API de usuarios (`/api/users`). Update por PATCH, baja lógica por DELETE. */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);
  private readonly base = '/users';

  list(page: number, limit: number, search?: string): Observable<PagedResponse<User>> {
    return this.api.getPaged<User>(this.base, { page, limit, search: search ?? '' });
  }

  getById(id: string): Observable<User> {
    return this.api.get<User>(`${this.base}/${id}`);
  }

  create(dto: CreateUserInput): Observable<User> {
    return this.api.post<User>(this.base, dto);
  }

  update(id: string, dto: UpdateUserInput): Observable<User> {
    return this.api.patch<User>(`${this.base}/${id}`, dto);
  }

  deactivate(id: string): Observable<User> {
    return this.api.delete<User>(`${this.base}/${id}`);
  }
}
