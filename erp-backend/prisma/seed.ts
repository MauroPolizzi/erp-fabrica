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

  // ── Permisos por rol (RBAC — enciende los 5 roles) ──
  // Administración usa el comodín admin.*; el resto recibe el subconjunto de su área.
  // Se incluyen permisos de módulos aún no enforçados (production/finance/invoicing/
  // reports) que ya existen en el catálogo, para no re-sembrar al implementarlos.
  const ROLE_PERMISSIONS: Record<string, string[]> = {
    Administración: ['admin.*'],
    Ventas: ['commercial.read', 'commercial.create', 'commercial.update', 'commercial.delete', 'inventory.read'],
    Stock: ['inventory.read', 'inventory.create', 'inventory.update', 'inventory.delete'],
    Producción: [
      'inventory.read', 'inventory.create', 'inventory.update',
      'production.read', 'production.create', 'production.update', 'production.delete',
    ],
    Finanzas: [
      'commercial.read', 'inventory.read',
      'finance.read', 'finance.create', 'finance.update', 'finance.delete',
      'invoicing.read', 'invoicing.create', 'invoicing.update', 'invoicing.delete',
      'reports.read',
    ],
  };

  const permissionByCode = new Map(allPermissions.map((p) => [p.code, p.id]));
  for (const [roleName, codes] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roles[roleName];
    await prisma.rolePermission.createMany({
      data: codes.map((code) => ({ roleId, permissionId: permissionByCode.get(code)! })),
      skipDuplicates: true,
    });
  }

  // ── Usuarios: admin + un usuario demo por rol para probar el RBAC ──
  // Password por convención de desarrollo: <slug>123 (p. ej. ventas123).
  const DEMO_USERS = [
    { email: 'admin@perlinor.local', fullName: 'Administrador', role: 'Administración', password: 'admin123' },
    { email: 'ventas@perlinor.local', fullName: 'Usuario Ventas', role: 'Ventas', password: 'ventas123' },
    { email: 'produccion@perlinor.local', fullName: 'Usuario Producción', role: 'Producción', password: 'produccion123' },
    { email: 'stock@perlinor.local', fullName: 'Usuario Stock', role: 'Stock', password: 'stock123' },
    { email: 'finanzas@perlinor.local', fullName: 'Usuario Finanzas', role: 'Finanzas', password: 'finanzas123' },
  ];

  for (const u of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, passwordHash, fullName: u.fullName, roleId: roles[u.role] },
    });
  }

  // ── Categorías de productos terminados (demo de venta) ──
  const finishedCategories = ['Materiales de construcción', 'Cemento y áridos'];
  for (const name of finishedCategories) {
    await prisma.category.upsert({
      where: { name_type: { name, type: 'FINISHED_PRODUCT' } },
      update: {},
      create: { name, type: 'FINISHED_PRODUCT' },
    });
  }

  // ── Caja de ventas (vincula el ingreso de cada venta — ROADMAP §8.7) ──
  const salesRegister = await prisma.cashRegister.findFirst({ where: { type: 'SALES' } });
  if (!salesRegister) {
    await prisma.cashRegister.create({ data: { name: 'Caja de Ventas', type: 'SALES' } });
  }

  console.log(
    'Seed completado: permisos, roles con permisos asignados, usuarios (admin + demo por rol) y categorías de PT.',
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
