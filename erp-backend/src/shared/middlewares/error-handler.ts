import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';
import { logger } from '../utils/logger';

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  // Si la respuesta ya empezó a escribirse (p. ej. la descarga de un reporte en
  // streaming), no se la puede reemplazar por un JSON de error: se delega al handler
  // por defecto de Express, que corta la conexión.
  if (res.headersSent) {
    logger.error('Error luego de enviar los headers', { err });
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Datos inválidos', details: err.flatten().fieldErrors });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  // Errores conocidos de Prisma → códigos HTTP apropiados.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[] | undefined)?.join(', ');
      return res.status(409).json({ error: 'Violación de unicidad', details: target });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Recurso no encontrado' });
    }
  }

  logger.error('Error no controlado', { err });
  return res.status(500).json({ error: 'Error interno del servidor' });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}
