import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '../../config/redis.js';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  let redisStatus = 'disconnected';
  try {
    const redis = getRedisClient();
    const ping = await redis.ping();
    if (ping === 'PONG') redisStatus = 'connected';
  } catch {
    redisStatus = 'error';
  }

  const isHealthy = dbStatus === 'connected' && redisStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
    version: process.env.npm_package_version ?? '1.0.0',
  });
});

export const healthRoutes = router;
