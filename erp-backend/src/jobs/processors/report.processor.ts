import { Worker } from 'bullmq';
import { connection, QUEUE_NAMES } from '../queue';
import { logger } from '../../shared/utils/logger';

/** Worker de generación de reportes (PDF/Excel). Stub: implementar por reporte. */
export const reportWorker = new Worker(
  QUEUE_NAMES.reports,
  async (job) => {
    logger.info('Procesando reporte', { id: job.id, name: job.name });
    // TODO: generar PDF (PDFKit) / Excel (ExcelJS) según job.data
  },
  { connection },
);
