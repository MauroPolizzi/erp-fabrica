import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, AuthUser, TokenPair } from '../models/auth.model';

const ACCESS_KEY = 'erp_access_token';
const REFRESH_KEY = 'erp_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly _currentUser = signal<AuthUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  get accessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }
  get refreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<ApiResponse<TokenPair>>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => this.storeTokens(res.data)),
        switchMap(() => this.loadProfile()),
      );
  }

  refresh(): Observable<TokenPair> {
    const token = this.refreshToken;
    if (!token) {
      return throwError(() => new Error('Sin refresh token'));
    }
    return this.http
      .post<ApiResponse<TokenPair>>(`${this.apiUrl}/auth/refresh`, { refreshToken: token })
      .pipe(
        tap((res) => this.storeTokens(res.data)),
        map((res) => res.data),
      );
  }

  /** Carga el perfil del usuario autenticado (/auth/me) en el signal. */
  loadProfile(): Observable<AuthUser> {
    if (!this.accessToken) {
      return of(null as unknown as AuthUser);
    }
    return this.http
      .get<ApiResponse<AuthUser>>(`${this.apiUrl}/auth/me`)
      .pipe(
        tap((res) => this._currentUser.set(res.data)),
        map((res) => res.data),
      );
  }

  hasPermission(permission: string): boolean {
    const user = this._currentUser();
    if (!user) return false;
    return user.permissions.includes('admin.*') || user.permissions.includes(permission);
  }

  logout(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this._currentUser.set(null);
  }

  private storeTokens(tokens: TokenPair): void {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  }
}
