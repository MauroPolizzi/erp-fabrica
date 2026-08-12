import type { PaymentMethod, Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { z } from 'zod';
import { prisma } from '../../../config/database';
import { formatDate, now, parseDateRange } from '../../../shared/utils/date';
import { defineReport, type ReportTotal } from '../report-types';

/**
 * Reporte "Ventas por período": una fila por línea de venta. Es el grano más fino
 * disponible, así el usuario agrega como quiera (por cliente, por material, por mes)
 * con una tabla dinámica, sin necesitar un reporte nuevo por cada corte.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_RANGE_DAYS = 30;

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  CARD: 'Tarjeta',
  CHECK: 'Cheque',
  ACCOUNT: 'Cuenta corriente',
};

const filtersSchema = z
  .object({
    from: z.string().regex(DATE_PATTERN, 'Formato de fecha esperado: YYYY-MM-DD').optional(),
    to: z.string().regex(DATE_PATTERN, 'Formato de fecha esperado: YYYY-MM-DD').optional(),
    customerId: z.string().uuid('Cliente inválido').optional(),
  })
  .refine((filters) => !filters.from || !filters.to || filters.from <= filters.to, {
    message: 'La fecha "desde" no puede ser posterior a "hasta"',
    path: ['from'],
  })
  // Sin rango explícito se reportan los últimos 30 días: la pantalla es útil sin configurar nada.
  .transform((filters) => ({
    ...parseDateRange(filters.from, filters.to, { defaultCount: DEFAULT_RANGE_DAYS }),
    customerId: filters.customerId,
  }));

type SalesByPeriodFilters = z.infer<typeof filtersSchema>;

/**
 * `saleId` y `saleTotal` no tienen columna: son auxiliares para que `totals` cuente
 * ventas distintas sin volver a la base (el writer solo escribe las claves de `columns`).
 */
type SalesByPeriodRow = {
  soldAt: Date;
  saleRef: string;
  customerName: string;
  customerTaxId: string;
  sku: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  paymentMethod: string;
  seller: string;
  saleId: string;
  saleTotal: string;
};

async function fetchRows(
  filters: SalesByPeriodFilters,
  options: { limit: number },
): Promise<SalesByPeriodRow[]> {
  // Solo ventas CONFIRMED: las anuladas revierten stock y caja, no deben computarse
  // (mismo criterio que el dashboard y la caja de ventas).
  const where: Prisma.SaleDetailWhereInput = {
    sale: {
      status: 'CONFIRMED',
      soldAt: { gte: filters.from, lte: filters.to },
      ...(filters.customerId ? { customerId: filters.customerId } : {}),
    },
  };

  const details = await prisma.saleDetail.findMany({
    where,
    select: {
      saleId: true,
      quantity: true,
      unitPrice: true,
      lineTotal: true,
      finishedProduct: { select: { sku: true, name: true, unit: true } },
      sale: {
        select: {
          soldAt: true,
          total: true,
          paymentMethod: true,
          customer: { select: { name: true, taxId: true } },
          createdBy: { select: { fullName: true } },
        },
      },
    },
    orderBy: [{ sale: { soldAt: 'asc' } }, { saleId: 'asc' }],
    // Una fila de más: le alcanza al servicio para detectar que el rango excede el tope.
    take: options.limit + 1,
  });

  return details.map((detail) => ({
    soldAt: detail.sale.soldAt,
    saleRef: detail.saleId.slice(0, 8),
    customerName: detail.sale.customer.name,
    customerTaxId: detail.sale.customer.taxId ?? '',
    sku: detail.finishedProduct.sku,
    productName: detail.finishedProduct.name,
    quantity: detail.quantity.toNumber(),
    unit: detail.finishedProduct.unit,
    unitPrice: detail.unitPrice.toNumber(),
    lineTotal: detail.lineTotal.toNumber(),
    paymentMethod: PAYMENT_METHOD_LABELS[detail.sale.paymentMethod],
    seller: detail.sale.createdBy?.fullName ?? '—',
    saleId: detail.saleId,
    saleTotal: detail.sale.total.toString(),
  }));
}

async function buildHeader(filters: SalesByPeriodFilters): Promise<string[]> {
  let customerLabel = 'Todos';
  if (filters.customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: filters.customerId },
      select: { name: true },
    });
    customerLabel = customer?.name ?? 'Cliente inexistente';
  }

  return [
    `Período: ${formatDate(filters.from)} al ${formatDate(filters.to)}`,
    `Cliente: ${customerLabel}`,
    'Incluye únicamente ventas confirmadas (las anuladas no se computan).',
    `Generado: ${formatDate(now(), 'DD/MM/YYYY HH:mm')}`,
  ];
}

function buildTotals(rows: SalesByPeriodRow[]): ReportTotal[] {
  // "Total vendido" se suma sobre VENTAS distintas usando sale.total, nunca sumando
  // lineTotal: hoy coinciden porque tax = 0, pero al incorporar IVA/descuentos la suma
  // de líneas dejaría de ser el total de la venta y el reporte quedaría mal en silencio.
  const totalBySale = new Map<string, string>();
  for (const row of rows) totalBySale.set(row.saleId, row.saleTotal);

  let sold = new Decimal(0);
  for (const total of totalBySale.values()) sold = sold.plus(total);

  let units = new Decimal(0);
  for (const row of rows) units = units.plus(row.quantity);

  return [
    { label: 'Cantidad de ventas', value: totalBySale.size, format: 'number' },
    { label: 'Unidades vendidas', value: units.toNumber(), format: 'quantity' },
    { label: 'Total vendido', value: sold.toNumber(), format: 'currency' },
  ];
}

export const salesByPeriodReport = defineReport({
  key: 'sales-by-period',
  title: 'Ventas por período',
  filtersSchema,
  columns: [
    { header: 'Fecha', key: 'soldAt', format: 'date' },
    { header: 'Venta', key: 'saleRef', width: 12 },
    { header: 'Cliente', key: 'customerName', width: 28 },
    { header: 'CUIT/Doc', key: 'customerTaxId', width: 16 },
    { header: 'SKU', key: 'sku', width: 14 },
    { header: 'Material', key: 'productName', width: 30 },
    { header: 'Cantidad', key: 'quantity', format: 'quantity' },
    { header: 'Unidad', key: 'unit', width: 10 },
    { header: 'Precio unitario', key: 'unitPrice', format: 'currency' },
    { header: 'Total línea', key: 'lineTotal', format: 'currency' },
    { header: 'Medio de pago', key: 'paymentMethod', width: 18 },
    { header: 'Vendedor', key: 'seller', width: 22 },
  ],
  fetch: fetchRows,
  header: buildHeader,
  totals: buildTotals,
  filename: (filters) =>
    `ventas-por-periodo_${formatDate(filters.from, 'YYYY-MM-DD')}_${formatDate(filters.to, 'YYYY-MM-DD')}`,
});
