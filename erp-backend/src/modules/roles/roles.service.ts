import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/app-error';

const roleSelect = {
  id: true,
  name: true,
  description: true,
  isActive: true,
  permissions: { select: { permission: { select: { code: true } } } },
} as const;

type RoleRow = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  permissions: { permission: { code: string } }[];
};

/** Aplana la M2M RolePermission a un array de códigos de permiso. */
function toRole(role: RoleRow) {
  const { permissions, ...rest } = role;
  return { ...rest, permissions: permissions.map((rp) => rp.permission.code) };
}

/**
 * Roles de solo lectura: los 5 roles son fijos y sus permisos se definen en el seed
 * (RBAC — ROADMAP §8.2). Expuesto para el dropdown del alta de usuarios y la vista
 * read-only de roles del frontend.
 */
export const rolesService = {
  async list() {
    const roles = await prisma.role.findMany({
      where: { isActive: true },
      select: roleSelect,
      orderBy: { name: 'asc' },
    });
    return roles.map(toRole);
  },

  async getById(id: string) {
    const role = await prisma.role.findUnique({ where: { id }, select: roleSelect });
    if (!role) throw AppError.notFound('Rol no encontrado');
    return toRole(role);
  },
};
