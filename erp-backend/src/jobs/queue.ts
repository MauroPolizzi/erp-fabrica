import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/environment';

export const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const QUEUE_NAMES = {
  reports: 'reports',
  email: 'email',
} as const;

export const reportQueue = new Queue(QUEUE_NAMES.reports, { connection });
export const emailQueue = new Queue(QUEUE_NAMES.email, { connection });
