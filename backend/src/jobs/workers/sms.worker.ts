import { Worker, type Job } from 'bullmq';
import { getRedisClient } from '../../config/redis.js';
import { notificationService } from '../../modules/notifications/notification.service.js';
import { logger } from '../../utils/logger.js';

interface SmsJobData {
  to: string;
  message: string;
}

export function startSmsWorker(): Worker {
  const worker = new Worker<SmsJobData>(
    'sms',
    async (job: Job<SmsJobData>) => {
      const { to, message } = job.data;
      await notificationService.sendSms(to, message);
      logger.info('SMS job completed', { jobId: job.id, to });
    },
    {
      connection: getRedisClient(),
      concurrency: 3,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error('SMS job failed', {
      jobId: job?.id,
      error: err.message,
      attempts: job?.attemptsMade,
    });
  });

  logger.info('📱 SMS worker started');
  return worker;
}
