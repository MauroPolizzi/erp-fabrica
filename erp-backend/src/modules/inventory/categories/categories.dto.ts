import { CategoryType } from '@prisma/client';
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2),
  type: z.nativeEnum(CategoryType),
});

export const listCategoryQuerySchema = z.object({
  type: z.nativeEnum(CategoryType).optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
