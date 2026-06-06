import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/environment';
import { AppError } from '../../shared/utils/app-error';

interface AccessPayload {
  sub: string;
  email: string;
  roleId: string;
}

/** Verifica el access token y adjunta req.user con sus permisos resueltos. */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw AppError.unauthorized();
    }
    const token = header.slice(7);

    let payload: AccessPayload;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
    } catch {
      throw AppError.unauthorized('Token inválido o expirado');
    }

    const role = await prisma.role.findUnique({
      where: { id: payload.roleId },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) {
      throw AppError.unauthorized();
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      roleId: payload.roleId,
      permissions: role.permissions.map((rp) => rp.permission.code),
    };
    return next();
  } catch (err) {
    return next(err);
  }
}
