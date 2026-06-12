import { z } from 'zod';

// currentStock NO se acepta por body: se gestiona solo vía movimientos (F3).
export const createFinishedProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(2),
  categoryId: z.string().uuid(),
  unit: z.string().min(1),
  salePrice: z.coerce.number().nonnegative(),
});

export const updateFinishedProductSchema = z.object({
  sku: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  categoryId: z.string().uuid().optional(),
  unit: z.string().min(1).optional(),
  salePrice: z.coerce.number().nonnegative().optional(),
});

export type CreateFinishedProductDto = z.infer<typeof createFinishedProductSchema>;
export type UpdateFinishedProductDto = z.infer<typeof updateFinishedProductSchema>;
