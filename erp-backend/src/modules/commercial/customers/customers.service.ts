import { prisma } from '../../../config/database';
import { writeAuditLog } from '../../../shared/middlewares/audit-log';
import { AppError } from '../../../shared/utils/app-error';
import { buildMeta, type PaginationParams } from '../../../shared/utils/pagination';
import type { CreateCustomerDto, UpdateCustomerDto } from './customers.dto';

const publicSelect = {
  id: true,
  name: true,
  taxId: true,
  email: true,
  phone: true,
  address: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const customersService = {
  async list(params: PaginationParams, search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { taxId: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.customer.findMany({ where, select: publicSelect, skip: params.skip, take: params.limit, orderBy: { createdAt: 'desc' } }),
      prisma.customer.count({ where }),
    ]);

    return { data, meta: buildMeta(total, params) };
  },

  async getById(id: string) {
    const customer = await prisma.customer.findUnique({ where: { id }, select: publicSelect });
    if (!customer) throw AppError.notFound('Cliente no encontrado');
    return customer;
  },

  async create(dto: CreateCustomerDto, actorId?: string) {
    const customer = await prisma.customer.create({
      data: { name: dto.name, taxId: dto.taxId, email: dto.email, phone: dto.phone, address: dto.address },
      select: publicSelect,
    });
    await writeAuditLog({ userId: actorId, action: 'CREATE', entity: 'Customer', entityId: customer.id, newValues: customer });
    return customer;
  },

  async update(id: string, dto: UpdateCustomerDto, actorId?: string) {
    const before = await this.getById(id);
    const customer = await prisma.customer.update({ where: { id }, data: dto, select: publicSelect });
    await writeAuditLog({ userId: actorId, action: 'UPDATE', entity: 'Customer', entityId: id, oldValues: before, newValues: customer });
    return customer;
  },

  /** Borrado lógico (CONTEXT §7: isActive, sin borrado físico). */
  async deactivate(id: string, actorId?: string) {
    const before = await this.getById(id);
    const customer = await prisma.customer.update({ where: { id }, data: { isActive: false }, select: publicSelect });
    await writeAuditLog({ userId: actorId, action: 'DELETE', entity: 'Customer', entityId: id, oldValues: before, newValues: customer });
    return customer;
  },
};
