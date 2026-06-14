import { PaymentMethod } from '@prisma/client';
import { z } from 'zod';

export const createSaleSchema = z.object({
  customerId: z.string().uuid(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  items: z
    .array(
      z.object({
        finishedProductId: z.string().uuid(),
        quantity: z.coerce.number().positive(),
      }),
    )
    .min(1, 'La venta debe tener al menos un ítem'),
});

export type CreateSaleDto = z.infer<typeof createSaleSchema>;
