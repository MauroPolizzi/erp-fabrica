import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error';

/**
 * Exige un permiso con formato `modulo.accion`.
 * El comodín `admin.*` concede acceso a todo (CONTEXT §8).
 */
export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(AppError.unauthorized());
    }

    const granted =
      user.permissions.includes('admin.*') || user.permissions.includes(permission);

    if (!granted) {
      return next(AppError.forbidden(`Falta el permiso: ${permission}`));
    }
    return next();
  };
}
