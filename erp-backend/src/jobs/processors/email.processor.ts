import { Worker } from 'bullmq';
import { connection, QUEUE_NAMES } from '../queue';
import { logger } from '../../shared/utils/logger';

/** Worker de envío de emails. Stub: integrar proveedor de correo. */
export const emailWorker = new Worker(
  QUEUE_NAMES.email,
  async (job) => {
    logger.info('Procesando email', { id: job.id, name: job.name });
    // TODO: enviar email según job.data
  },
  { connection },
);
