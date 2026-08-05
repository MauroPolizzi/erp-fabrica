import { Decimal } from 'decimal.js';
import { prisma } from '../../../config/database';
import { writeAuditLog } from '../../../shared/middlewares/audit-log';
import { AppError } from '../../../shared/utils/app-error';
import { buildMeta, type PaginationParams } from '../../../shared/utils/pagination';
import type { CreateSaleDto } from './sales.dto';

const saleInclude = {
  customer: { select: { id: true, name: true, taxId: true } },
  createdBy: { select: { id: true, fullName: true } },
  details: {
    select: { id: true, finishedProductId: true, quantity: true, unitPrice: true, lineTotal: true },
  },
} as const;

export const salesService = {
  async list(params: PaginationParams) {
    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        include: saleInclude,
        skip: params.skip,
        take: params.limit,
        orderBy: { soldAt: 'desc' },
      }),
      prisma.sale.count(),
    ]);

    return { data, meta: buildMeta(total, params) };
  },

  async getById(id: string) {
    const sale = await prisma.sale.findUnique({ where: { id }, include: saleInclude });
    if (!sale) throw AppError.notFound('Venta no encontrada');
    return sale;
  },

  /**
   * Crea la venta de forma transaccional (CONTEXT §7):
   *  1. Valida cliente activo.
   *  2. Lee productos DENTRO de la transacción, congela el precio desde salePrice
   *     y pre-valida existencia/estado/stock por producto (agrega cantidades por si se repite).
   *  3. Descuenta stock con un decremento ATÓMICO y condicional por producto
   *     (UPDATE ... WHERE current_stock >= required). Postgres bloquea la fila, de modo
   *     que dos ventas concurrentes no pueden sobre-vender: si el stock ya fue consumido,
   *     count === 0 → 422 + rollback completo.
   *  4. Crea Sale + SaleDetail con totales calculados con decimal.js (sin IVA: total = subtotal).
   *  5. Genera movimientos OUT con reference = sale.id.
   */
  async create(dto: CreateSaleDto, actorId?: string) {
    const sale = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: dto.customerId } });
      if (!customer || !customer.isActive) {
        throw AppError.badRequest('El cliente no existe o está inactivo');
      }

      // Cantidad total requerida por producto (soporta líneas repetidas del mismo producto).
      const requiredByProduct = new Map<string, Decimal>();
      for (const item of dto.items) {
        const prev = requiredByProduct.get(item.finishedProductId) ?? new Decimal(0);
        requiredByProduct.set(item.finishedProductId, prev.plus(item.quantity));
      }

      const productIds = [...requiredByProduct.keys()];
      const products = await tx.finishedProduct.findMany({ where: { id: { in: productIds } } });
      const productById = new Map(products.map((p) => [p.id, p]));

      // Pre-validación de existencia y estado (mensajes claros). El stock leído aquí es
      // solo indicativo: el guard autoritativo es el decremento atómico de más abajo.
      for (const [productId, required] of requiredByProduct) {
        const product = productById.get(productId);
        if (!product || !product.isActive) {
          throw AppError.badRequest(`Producto inexistente o inactivo: ${productId}`);
        }
        if (new Decimal(product.currentStock.toString()).lessThan(required)) {
          throw AppError.unprocessable(
            `Stock insuficiente para ${product.name} (disponible ${product.currentStock}, requerido ${required})`,
          );
        }
      }

      // Descuento atómico y condicional por producto: UPDATE ... WHERE current_stock >= required.
      // Evita oversell por concurrencia (lost update): si otra venta ya consumió el stock,
      // el WHERE no matchea y count === 0 → 422 + rollback.
      for (const [productId, required] of requiredByProduct) {
        const product = productById.get(productId)!;
        const { count } = await tx.finishedProduct.updateMany({
          where: { id: productId, currentStock: { gte: required.toFixed(3) } },
          data: { currentStock: { decrement: required.toFixed(3) } },
        });
        if (count === 0) {
          throw AppError.unprocessable(`Stock insuficiente para ${product.name}`);
        }
      }

      // Construcción de líneas con precio congelado y totales con decimal.js.
      let subtotal = new Decimal(0);
      const detailRows = dto.items.map((item) => {
        const product = productById.get(item.finishedProductId)!;
        const unitPrice = new Decimal(product.salePrice.toString());
        const lineTotal = unitPrice.times(item.quantity);
        subtotal = subtotal.plus(lineTotal);
        return {
          finishedProductId: item.finishedProductId,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          lineTotal: lineTotal.toFixed(2),
        };
      });

      const total = subtotal; // sin IVA en la demo

      const created = await tx.sale.create({
        data: {
          customerId: dto.customerId,
          createdById: actorId ?? null,
          status: 'CONFIRMED',
          paymentMethod: dto.paymentMethod,
          subtotal: subtotal.toFixed(2),
          tax: '0',
          total: total.toFixed(2),
          details: { create: detailRows },
        },
        include: saleInclude,
      });

      // Movimiento OUT por línea (trazabilidad), referenciando la venta.
      for (const item of dto.items) {
        await tx.finishedProductMovement.create({
          data: { finishedProductId: item.finishedProductId, type: 'OUT', quantity: item.quantity, reference: created.id },
        });
      }

      return created;
    });

    await writeAuditLog({ userId: actorId, action: 'CREATE', entity: 'Sale', entityId: sale.id, newValues: sale });
    return sale;
  },

  /**
   * Anula una venta CONFIRMADA de forma transaccional (inverso de create):
   *  1. Guard atómico de estado (updateMany where status=CONFIRMED). Si count===0 la venta
   *     no existe como confirmada (ya anulada u otra anulación concurrente ganó) → 422.
   *  2. Repone stock por producto (increment) y genera movimientos IN de reversión.
   *  3. Audita el cambio de estado.
   */
  async cancel(id: string, actorId?: string) {
    await prisma.$transaction(async (tx) => {
      const current = await tx.sale.findUnique({ where: { id }, include: { details: true } });
      if (!current) throw AppError.notFound('Venta no encontrada');
      if (current.status !== 'CONFIRMED') {
        throw AppError.unprocessable('Solo se pueden anular ventas confirmadas');
      }

      // Guard atómico: solo una anulación concurrente pasa de CONFIRMED a CANCELLED.
      const { count } = await tx.sale.updateMany({
        where: { id, status: 'CONFIRMED' },
        data: { status: 'CANCELLED' },
      });
      if (count === 0) throw AppError.unprocessable('La venta ya no está confirmada');

      // Reposición de stock: movimiento IN por línea + increment agregado por producto.
      const restoreByProduct = new Map<string, Decimal>();
      for (const line of current.details) {
        const prev = restoreByProduct.get(line.finishedProductId) ?? new Decimal(0);
        restoreByProduct.set(line.finishedProductId, prev.plus(line.quantity.toString()));

        await tx.finishedProductMovement.create({
          data: {
            finishedProductId: line.finishedProductId,
            type: 'IN',
            quantity: line.quantity,
            reference: `Anulación venta ${id}`,
          },
        });
      }

      for (const [productId, qty] of restoreByProduct) {
        await tx.finishedProduct.update({
          where: { id: productId },
          data: { currentStock: { increment: qty.toFixed(3) } },
        });
      }
    });

    await writeAuditLog({
      userId: actorId,
      action: 'UPDATE',
      entity: 'Sale',
      entityId: id,
      oldValues: { status: 'CONFIRMED' },
      newValues: { status: 'CANCELLED' },
    });
    return this.getById(id);
  },
};
