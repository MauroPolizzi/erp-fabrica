import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/app-error';
import { buildMeta, type PaginationParams } from '../../shared/utils/pagination';
import { writeAuditLog } from '../../shared/middlewares/audit-log';
import type { CreateUserDto, UpdateUserDto } from './users.dto';

const publicSelect = {
  id: true,
  email: true,
  fullName: true,
  roleId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const usersService = {
  async list(params: PaginationParams, search?: string) {
    const where = search
      ? { OR: [{ email: { contains: search, mode: 'insensitive' as const } }, { fullName: { contains: search, mode: 'insensitive' as const } }] }
      : {};

    const [data, total] = await Promise.all([
      prisma.user.findMany({ where, select: publicSelect, skip: params.skip, take: params.limit, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    return { data, meta: buildMeta(total, params) };
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: publicSelect });
    if (!user) throw AppError.notFound('Usuario no encontrado');
    return user;
  },

  async create(dto: CreateUserDto, actorId?: string) {
    const exists = await prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw AppError.conflict('El email ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await prisma.user.create({
      data: { email: dto.email, passwordHash, fullName: dto.fullName, roleId: dto.roleId },
      select: publicSelect,
    });
    await writeAuditLog({ userId: actorId, action: 'CREATE', entity: 'User', entityId: user.id, newValues: user });
    return user;
  },

  async update(id: string, dto: UpdateUserDto, actorId?: string) {
    const before = await this.getById(id);
    const user = await prisma.user.update({ where: { id }, data: dto, select: publicSelect });
    await writeAuditLog({ userId: actorId, action: 'UPDATE', entity: 'User', entityId: id, oldValues: before, newValues: user });
    return user;
  },

  /** Borrado lógico (CONTEXT §7: isActive, sin borrado físico). */
  async deactivate(id: string, actorId?: string) {
    const before = await this.getById(id);
    const user = await prisma.user.update({ where: { id }, data: { isActive: false }, select: publicSelect });
    await writeAuditLog({ userId: actorId, action: 'DELETE', entity: 'User', entityId: id, oldValues: before, newValues: user });
    return user;
  },
};
