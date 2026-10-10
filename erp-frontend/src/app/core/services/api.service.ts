import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
export interface PagedResponse<T> {
  data: T[];
  meta: PageMeta;
}

/**
 * Wrapper genérico sobre HttpClient: prefija apiUrl y desempaqueta el sobre { data }.
 * Listados con paginación server-side usan getPaged().
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.base}${path}`, { params: this.toParams(params) })
      .pipe(map((res) => res.data));
  }

  getPaged<T>(path: string, params?: Record<string, string | number | boolean>): Observable<PagedResponse<T>> {
    return this.http.get<PagedResponse<T>>(`${this.base}${path}`, { params: this.toParams(params) });
  }

  /**
   * Descarga binaria (reportes). A diferencia de `get`, no desempaqueta ningún sobre:
   * se observa la respuesta completa para poder leer el nombre del archivo y los
   * metadatos que el backend manda por cabecera (Content-Disposition, X-Report-Rows).
   */
  getBlob(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.base}${path}`, {
      params: this.toParams(params),
      responseType: 'blob',
      observe: 'response',
    });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.base}${path}`, body).pipe(map((res) => res.data));
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.base}${path}`, body).pipe(map((res) => res.data));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.base}${path}`, body).pipe(map((res) => res.data));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.base}${path}`).pipe(map((res) => res.data));
  }

  private toParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      }
    }
    return httpParams;
  }
}
