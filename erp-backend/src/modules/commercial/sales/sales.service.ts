import { Decimal } from 'decimal.js';
import { prisma } from '../../../config/database';
import { writeAuditLog } from '../../../shared/middlewares/audit-log';
import { AppError } from '../../../shared/utils/app-error';
import { buildMeta, type PaginationParams } from '../../../shared/utils/pagination';
import type { CreateSaleDto } from './sales.dto';

const saleInclude = {
  customer: { select: { id: true, name: true, taxId: true } },
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
   *     y valida stock suficiente por producto (agrega cantidades por si se repite).
   *  3. Si falta stock → 422 + rollback completo.
   *  4. Crea Sale + SaleDetail con totales calculados con decimal.js (sin IVA: total = subtotal).
   *  5. Descuenta currentStock y genera movimientos OUT con reference = sale.id.
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

      // Validación de existencia, estado y stock suficiente.
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

      // Descuento de stock una vez por producto (cantidad total agregada ya validada).
      for (const [productId, required] of requiredByProduct) {
        const product = productById.get(productId)!;
        const newStock = new Decimal(product.currentStock.toString()).minus(required);
        await tx.finishedProduct.update({ where: { id: productId }, data: { currentStock: newStock.toString() } });
      }

      return created;
    });

    await writeAuditLog({ userId: actorId, action: 'CREATE', entity: 'Sale', entityId: sale.id, newValues: sale });
    return sale;
  },
};
