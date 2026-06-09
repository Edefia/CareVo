import { Worker, type Job } from 'bullmq';
import { getRedisClient } from '../../config/redis.js';
import { notificationService } from '../../modules/notifications/notification.service.js';
import { logger } from '../../utils/logger.js';

interface EmailJobData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

export function startEmailWorker(): Worker {
  const worker = new Worker<EmailJobData>(
    'email',
    async (job: Job<EmailJobData>) => {
      const { to, subject, template, data } = job.data;
      await notificationService.sendEmail(to, subject, template, data);
      logger.info('Email job completed', { jobId: job.id, to, subject });
    },
    {
      connection: getRedisClient(),
      concurrency: 5,
    },
  );

  worker.on('failed', (job, err) => {
    logger.error('Email job failed', {
      jobId: job?.id,
      error: err.message,
      attempts: job?.attemptsMade,
    });
  });

  logger.info('📧 Email worker started');
  return worker;
}
