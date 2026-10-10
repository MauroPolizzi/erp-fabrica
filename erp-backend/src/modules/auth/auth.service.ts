import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/environment';
import { writeAuditLog } from '../../shared/middlewares/audit-log';
import { AppError } from '../../shared/utils/app-error';
import { sendMail } from '../../shared/utils/mailer';
import type { LoginDto } from './auth.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AccessPayload {
  sub: string;
  email: string;
  roleId: string;
}

function signTokens(payload: AccessPayload): TokenPair {
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ sub: payload.sub }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

/** El token viaja en claro solo en el mail; en la base vive únicamente su hash. */
function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Busca un token de reset vigente (existente, no usado y no expirado). */
async function findValidResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
    include: { user: true },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date()) return null;
  if (!record.user.isActive) return null;
  return record;
}

export const authService = {
  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) {
      throw AppError.unauthorized('Credenciales inválidas');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw AppError.unauthorized('Credenciales inválidas');
    }
    return signTokens({ sub: user.id, email: user.email, roleId: user.roleId });
  },

  async refresh(refreshToken: string): Promise<TokenPair> {
    let decoded: { sub: string };
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
    } catch {
      throw AppError.unauthorized('Refresh token inválido');
    }
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user || !user.isActive) {
      throw AppError.unauthorized('Usuario no válido');
    }
    return signTokens({ sub: user.id, email: user.email, roleId: user.roleId });
  },

  /**
   * Emite un token de recuperación y manda el mail con el link.
   *
   * No informa nada sobre el destinatario: si el email no existe o el usuario está
   * inactivo, termina en silencio. El controller responde siempre lo mismo, así que
   * el endpoint no sirve para averiguar qué direcciones están registradas.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return;

    // Solo el último link pedido queda vigente.
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60_000);
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashResetToken(token), expiresAt },
    });

    const link = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: 'Recuperación de contraseña — ERP PerliNor',
      text:
        `Hola ${user.fullName}:\n\n` +
        `Recibimos un pedido para restablecer tu contraseña. Entrá al siguiente link ` +
        `para elegir una nueva:\n\n${link}\n\n` +
        `El link vence en ${env.PASSWORD_RESET_TTL_MINUTES} minutos y se puede usar una sola vez.\n` +
        `Si no pediste este cambio, ignorá este mensaje: tu contraseña sigue siendo la misma.`,
    });
  },

  /** Permite al frontend mostrar "link vencido" antes de pedir la contraseña nueva. */
  async validateResetToken(token: string): Promise<boolean> {
    return (await findValidResetToken(token)) !== null;
  },

  async resetPassword(token: string, password: string): Promise<void> {
    const record = await findValidResetToken(token);
    if (!record) {
      throw AppError.badRequest('El enlace de recuperación es inválido o expiró');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.$transaction(async (tx) => {
      // Consumo atómico del token: la condición `usedAt: null` viaja en el UPDATE, así
      // que ante dos requests simultáneas con el mismo token solo una obtiene count 1
      // y la otra revierte. (Mismo criterio que el descuento de stock en sales.service.)
      const consumed = await tx.passwordResetToken.updateMany({
        where: { id: record.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (consumed.count === 0) {
        throw AppError.badRequest('El enlace de recuperación es inválido o expiró');
      }

      await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
      // Un solo uso: el resto de los tokens del usuario dejan de servir.
      await tx.passwordResetToken.deleteMany({
        where: { userId: record.userId, id: { not: record.id } },
      });
    });

    // Sin valores: el hash de la contraseña no debe quedar en la auditoría.
    await writeAuditLog({
      userId: record.userId,
      action: 'UPDATE',
      entity: 'User',
      entityId: record.userId,
    });
  },
};
