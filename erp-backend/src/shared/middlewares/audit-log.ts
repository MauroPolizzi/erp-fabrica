import { prisma } from '../../config/database';
import { logger } from '../utils/logger';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

interface AuditInput {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  oldValues?: unknown;
  newValues?: unknown;
}

/**
 * Registra una operación crítica en audit_logs (CONTEXT §7).
 * Pensado para invocarse desde los services, dentro o fuera de la transacción.
 */
export async function writeAuditLog(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        oldValues: (input.oldValues as object) ?? undefined,
        newValues: (input.newValues as object) ?? undefined,
      },
    });
  } catch (err) {
    logger.error('No se pudo escribir AuditLog', { err, entity: input.entity });
  }
}
