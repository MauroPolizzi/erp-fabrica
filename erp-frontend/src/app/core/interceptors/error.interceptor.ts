import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

const FALLBACK_MESSAGE = 'Ocurrió un error inesperado';

/**
 * Notifica errores HTTP al usuario. Ignora los 401 (los maneja el jwtInterceptor
 * con el flujo de refresh).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) {
        // En una descarga (responseType: 'blob') el cuerpo del error también llega como
        // Blob, así que hay que leerlo para no mostrarle "[object Blob]" al usuario.
        if (err.error instanceof Blob) {
          err.error
            .text()
            .then((text) => notify.error(parseErrorText(text) ?? err.message ?? FALLBACK_MESSAGE))
            .catch(() => notify.error(err.message ?? FALLBACK_MESSAGE));
        } else {
          notify.error(err.error?.error ?? err.message ?? FALLBACK_MESSAGE);
        }
      }
      return throwError(() => err);
    }),
  );
};

/** Extrae el mensaje del sobre de error del backend (`{ error, details? }`) serializado. */
function parseErrorText(text: string): string | undefined {
  try {
    const body = JSON.parse(text) as { error?: unknown };
    return typeof body.error === 'string' ? body.error : undefined;
  } catch {
    return undefined;
  }
}
