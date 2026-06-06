import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/**
 * Notifica errores HTTP al usuario. Ignora los 401 (los maneja el jwtInterceptor
 * con el flujo de refresh).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) {
        const detail = err.error?.error ?? err.message ?? 'Ocurrió un error inesperado';
        notify.error(detail);
      }
      return throwError(() => err);
    }),
  );
};
