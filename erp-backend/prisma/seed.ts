import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Permisos base por módulo (formato modulo.accion — CONTEXT §8)
const MODULES = [
  'users',
  'employees',
  'inventory',
  'production',
  'commercial',
  'sales',
  'finance',
  'invoicing',
  'reports',
  'audit',
];
const ACTIONS = ['read', 'create', 'update', 'delete'];

async function main() {
  // ── Permisos ──
  const permissionCodes = MODULES.flatMap((m) => ACTIONS.map((a) => `${m}.${a}`));
  permissionCodes.push('admin.*'); // comodín de administrador

  await prisma.permission.createMany({
    data: permissionCodes.map((code) => ({ code })),
    skipDuplicates: true,
  });

  const allPermissions = await prisma.permission.findMany();

  // ── Roles (CONTEXT §1) ──
  const roleNames = ['Administración', 'Ventas', 'Producción', 'Stock', 'Finanzas'];
  const roles: Record<string, string> = {};
  for (const name of roleNames) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roles[name] = role.id;
  }

  // Administración recibe admin.* (todos los permisos vía comodín)
  const adminWildcard = allPermissions.find((p) => p.code === 'admin.*')!;
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: roles['Administración'], permissionId: adminWildcard.id } },
    update: {},
    create: { roleId: roles['Administración'], permissionId: adminWildcard.id },
  });

  // ── Usuario administrador inicial ──
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@perlinor.local' },
    update: {},
    create: {
      email: 'admin@perlinor.local',
      passwordHash,
      fullName: 'Administrador',
      roleId: roles['Administración'],
    },
  });

  // ── Categorías de productos terminados (demo de venta) ──
  const finishedCategories = ['Materiales de construcción', 'Cemento y áridos'];
  for (const name of finishedCategories) {
    await prisma.category.upsert({
      where: { name_type: { name, type: 'FINISHED_PRODUCT' } },
      update: {},
      create: { name, type: 'FINISHED_PRODUCT' },
    });
  }

  console.log(
    'Seed completado: permisos, roles, usuario admin@perlinor.local (admin123) y categorías de producto terminado.',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
