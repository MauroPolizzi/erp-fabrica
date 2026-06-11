import { z } from 'zod';

export const createEmployeesSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  document: z.string().min(7),
  position: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  hireDate: z.coerce.date().optional(),
});

export const updateEmployeesSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  document: z.string().min(7).optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  hireDate: z.coerce.date().optional(),
});

export type CreateEmployeesDto = z.infer<typeof createEmployeesSchema>;
export type UpdateEmployeesDto = z.infer<typeof updateEmployeesSchema>;
