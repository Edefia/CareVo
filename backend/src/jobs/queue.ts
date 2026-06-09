import { Queue } from 'bullmq';
import { getRedisClient } from '../config/redis.js';

function createQueue(name: string): Queue {
  return new Queue(name, {
    connection: getRedisClient(),
    defaultJobOptions: {
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 },
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  });
}

export const emailQueue = createQueue('email');
export const smsQueue = createQueue('sms');
export const cleanupQueue = createQueue('cleanup');
