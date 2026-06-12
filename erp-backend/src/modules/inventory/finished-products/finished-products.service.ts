import { prisma } from '../../../config/database';
import { writeAuditLog } from '../../../shared/middlewares/audit-log';
import { AppError } from '../../../shared/utils/app-error';
import { buildMeta, type PaginationParams } from '../../../shared/utils/pagination';
import type { CreateFinishedProductDto, UpdateFinishedProductDto } from './finished-products.dto';

const publicSelect = {
  id: true,
  sku: true,
  name: true,
  categoryId: true,
  unit: true,
  currentStock: true,
  salePrice: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const detailSelect = {
  ...publicSelect,
  category: { select: { id: true, name: true, type: true } },
} as const;

async function assertCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw AppError.badRequest('La categoría indicada no existe');
}

export const finishedProductsService = {
  async list(params: PaginationParams, search?: string) {
    const where = search
      ? {
          OR: [
            { sku: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.finishedProduct.findMany({ where, select: publicSelect, skip: params.skip, take: params.limit, orderBy: { createdAt: 'desc' } }),
      prisma.finishedProduct.count({ where }),
    ]);

    return { data, meta: buildMeta(total, params) };
  },

  async getById(id: string) {
    const product = await prisma.finishedProduct.findUnique({ where: { id }, select: detailSelect });
    if (!product) throw AppError.notFound('Producto terminado no encontrado');
    return product;
  },

  async create(dto: CreateFinishedProductDto, actorId?: string) {
    const exists = await prisma.finishedProduct.findUnique({ where: { sku: dto.sku } });
    if (exists) throw AppError.conflict('El SKU ya fue registrado');
    await assertCategoryExists(dto.categoryId);

    const product = await prisma.finishedProduct.create({
      data: { sku: dto.sku, name: dto.name, categoryId: dto.categoryId, unit: dto.unit, salePrice: dto.salePrice },
      select: publicSelect,
    });
    await writeAuditLog({ userId: actorId, action: 'CREATE', entity: 'FinishedProduct', entityId: product.id, newValues: product });
    return product;
  },

  /** Actualiza datos del producto. No toca currentStock (eso es por movimientos). */
  async update(id: string, dto: UpdateFinishedProductDto, actorId?: string) {
    const before = await this.getById(id);

    if (dto.sku && dto.sku !== before.sku) {
      const exists = await prisma.finishedProduct.findUnique({ where: { sku: dto.sku } });
      if (exists) throw AppError.conflict('El SKU ya fue registrado');
    }
    if (dto.categoryId) await assertCategoryExists(dto.categoryId);

    const product = await prisma.finishedProduct.update({ where: { id }, data: dto, select: publicSelect });
    await writeAuditLog({ userId: actorId, action: 'UPDATE', entity: 'FinishedProduct', entityId: id, oldValues: before, newValues: product });
    return product;
  },

  /** Borrado lógico (CONTEXT §7: isActive, sin borrado físico). */
  async deactivate(id: string, actorId?: string) {
    const before = await this.getById(id);
    const product = await prisma.finishedProduct.update({ where: { id }, data: { isActive: false }, select: publicSelect });
    await writeAuditLog({ userId: actorId, action: 'DELETE', entity: 'FinishedProduct', entityId: id, oldValues: before, newValues: product });
    return product;
  },
};
