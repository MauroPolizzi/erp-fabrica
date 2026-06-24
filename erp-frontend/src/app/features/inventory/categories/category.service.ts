import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Category, CategoryType } from '../../../core/models/domain.model';

/** Payload de alta de categoría (espejo de categories.dto del backend). */
export interface CategoryInput {
  name: string;
  type: CategoryType;
}

/** Acceso a la API de categorías (`/api/categories`). Listado simple sin paginar. */
@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiService);
  private readonly base = '/categories';

  list(type?: CategoryType): Observable<Category[]> {
    return this.api.get<Category[]>(this.base, type ? { type } : undefined);
  }

  create(dto: CategoryInput): Observable<Category> {
    return this.api.post<Category>(this.base, dto);
  }
}
