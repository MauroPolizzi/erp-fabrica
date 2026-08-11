import dayjs from 'dayjs';
import { prisma } from '../../config/database';

/**
 * Métricas de gestión para la home. Todo se calcula sobre datos confiables:
 * las ventas cuentan solo CONFIRMED (las anuladas no suman). "Stock bajo" son los
 * productos activos con menor stock (sin umbral por producto: eso es Fase 2 / minStock).
 */
export const dashboardService = {
  async getSummary() {
    const now = dayjs();
    const startOfMonth = now.startOf('month').toDate();
    const startOfDay = now.startOf('day').toDate();
    const endOfDay = now.endOf('day').toDate();

    const [monthAgg, todayAgg, activeProducts, activeCustomers, topCustomersRaw, lowStock] = await Promise.all([
      prisma.sale.aggregate({
        _sum: { total: true },
        _count: true,
        where: { status: 'CONFIRMED', soldAt: { gte: startOfMonth } },
      }),
      prisma.sale.aggregate({
        _sum: { total: true },
        _count: true,
        where: { status: 'CONFIRMED', soldAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.finishedProduct.count({ where: { isActive: true } }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.sale.groupBy({
        by: ['customerId'],
        where: { status: 'CONFIRMED' },
        _sum: { total: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 5,
      }),
      prisma.finishedProduct.findMany({
        where: { isActive: true },
        orderBy: { currentStock: 'asc' },
        take: 5,
        select: { id: true, sku: true, name: true, unit: true, currentStock: true },
      }),
    ]);

    // Resolución de nombres para el top de clientes (groupBy no trae relaciones).
    const customers = await prisma.customer.findMany({
      where: { id: { in: topCustomersRaw.map((c) => c.customerId) } },
      select: { id: true, name: true },
    });
    const nameById = new Map(customers.map((c) => [c.id, c.name]));

    return {
      salesMonth: { total: monthAgg._sum.total?.toString() ?? '0', count: monthAgg._count },
      salesToday: { total: todayAgg._sum.total?.toString() ?? '0', count: todayAgg._count },
      activeProducts,
      activeCustomers,
      topCustomers: topCustomersRaw.map((c) => ({
        customerId: c.customerId,
        name: nameById.get(c.customerId) ?? '—',
        total: c._sum.total?.toString() ?? '0',
      })),
      lowStock: lowStock.map((p) => ({ ...p, currentStock: p.currentStock.toString() })),
    };
  },
};
