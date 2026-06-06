import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Exige el permiso declarado en la ruta: `data: { permission: 'modulo.accion' }`.
 * Si la ruta no declara permiso, se permite el acceso.
 */
export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const required = route.data?.['permission'] as string | undefined;
  if (!required || auth.hasPermission(required)) {
    return true;
  }
  return router.createUrlTree(['/']);
};
