import { CategoryType } from '@prisma/client';
import { prisma } from '../../../config/database';
import { writeAuditLog } from '../../../shared/middlewares/audit-log';
import { AppError } from '../../../shared/utils/app-error';
import type { CreateCategoryDto } from './categories.dto';

const publicSelect = {
  id: true,
  name: true,
  type: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const categoriesService = {
  /** Listado simple (pocas filas, sin paginación). Filtra por tipo si se indica. */
  async list(type?: CategoryType) {
    return prisma.category.findMany({
      where: type ? { type } : {},
      select: publicSelect,
      orderBy: { name: 'asc' },
    });
  },

  async create(dto: CreateCategoryDto, actorId?: string) {
    const exists = await prisma.category.findUnique({
      where: { name_type: { name: dto.name, type: dto.type } },
    });
    if (exists) throw AppError.conflict('Ya existe una categoría con ese nombre y tipo');

    const category = await prisma.category.create({
      data: { name: dto.name, type: dto.type },
      select: publicSelect,
    });
    await writeAuditLog({ userId: actorId, action: 'CREATE', entity: 'Category', entityId: category.id, newValues: category });
    return category;
  },
};
