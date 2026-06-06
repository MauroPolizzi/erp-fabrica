import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { env } from '../../config/environment';
import { AppError } from '../../shared/utils/app-error';
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
};
