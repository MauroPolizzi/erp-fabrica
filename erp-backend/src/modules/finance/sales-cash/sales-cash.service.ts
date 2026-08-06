import { prisma } from '../../../config/database';
import { AppError } from '../../../shared/utils/app-error';
import { buildMeta, type PaginationParams } from '../../../shared/utils/pagination';

const registerSelect = {
  id: true,
  name: true,
  type: true,
  balance: true,
  isActive: true,
} as const;

/** La caja de ventas es única (type SALES). La crea el seed. */
async function getSalesRegisterOrThrow() {
  const register = await prisma.cashRegister.findFirst({
    where: { type: 'SALES', isActive: true },
    select: registerSelect,
  });
  if (!register) throw AppError.notFound('No hay una caja de ventas configurada');
  return register;
}

/**
 * Caja de ventas de solo lectura: saldo + movimientos. Los movimientos los generan
 * las ventas (ingreso) y las anulaciones (reversión), no se cargan manualmente.
 */
export const salesCashService = {
  async getRegister() {
    return getSalesRegisterOrThrow();
  },

  async listMovements(params: PaginationParams) {
    const register = await getSalesRegisterOrThrow();
    const where = { cashRegisterId: register.id };

    const [data, total] = await Promise.all([
      prisma.cashMovement.findMany({ where, skip: params.skip, take: params.limit, orderBy: { createdAt: 'desc' } }),
      prisma.cashMovement.count({ where }),
    ]);

    return { data, meta: buildMeta(total, params) };
  },
};
