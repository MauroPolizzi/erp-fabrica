import { Decimal } from 'decimal.js';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/app-error';
// dayjs del util compartido: trae el locale es-AR aplicado, del que depende que
// startOf('week') arranque el lunes y no el domingo.
import { dayjs } from '../../shared/utils/date';
import { MAX_BUCKETS, type SalesSeriesFilters } from './dashboard.dto';

/** Punto de la serie: `label` es la fecha de inicio del bucket (YYYY-MM-DD). */
export interface SalesSeriesPoint {
  label: string;
  total: string;
  count: number;
}

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

  /**
   * Serie temporal de ventas confirmadas, agrupada por día, semana o mes.
   *
   * La agregación se hace en JS y no con `date_trunc` en SQL: `sold_at` es un
   * TIMESTAMP sin zona que guarda UTC, así que agrupar en la base correría al día
   * siguiente toda venta posterior a las 21:00 (ART). Con dayjs se usa la hora del
   * servidor —el mismo criterio que `getSummary`—, de modo que el total de hoy en la
   * serie coincide con el KPI "Ventas de hoy".
   *
   * Si el volumen algún día lo exigiera, esto se reemplaza por `$queryRaw` con
   * `AT TIME ZONE` sin tocar el contrato de la respuesta.
   */
  async getSalesSeries(filters: SalesSeriesFilters) {
    const start = dayjs(filters.from).startOf(filters.groupBy);
    const end = dayjs(filters.to).startOf(filters.groupBy);
    const bucketCount = end.diff(start, filters.groupBy) + 1;

    const max = MAX_BUCKETS[filters.groupBy];
    if (bucketCount > max) {
      throw AppError.unprocessable(
        `El rango supera los ${max} puntos para esta agrupación. Achicá el período.`,
      );
    }

    const sales = await prisma.sale.findMany({
      where: { status: 'CONFIRMED', soldAt: { gte: filters.from, lte: filters.to } },
      select: { soldAt: true, total: true },
    });

    const totals = new Map<string, { total: Decimal; count: number }>();
    for (const sale of sales) {
      const key = dayjs(sale.soldAt).startOf(filters.groupBy).format('YYYY-MM-DD');
      const current = totals.get(key) ?? { total: new Decimal(0), count: 0 };
      totals.set(key, {
        total: current.total.plus(sale.total.toString()),
        count: current.count + 1,
      });
    }

    // Se emiten TODOS los buckets del rango, incluidos los vacíos: omitirlos haría que
    // el gráfico una dos días con ventas y aparente una continuidad que no existió.
    const points: SalesSeriesPoint[] = [];
    for (let i = 0; i < bucketCount; i++) {
      const label = start.add(i, filters.groupBy).format('YYYY-MM-DD');
      const bucket = totals.get(label);
      points.push({
        label,
        total: (bucket?.total ?? new Decimal(0)).toFixed(2),
        count: bucket?.count ?? 0,
      });
    }

    return {
      groupBy: filters.groupBy,
      from: dayjs(filters.from).format('YYYY-MM-DD'),
      to: dayjs(filters.to).format('YYYY-MM-DD'),
      points,
    };
  },
};
