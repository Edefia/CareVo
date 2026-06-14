import { Router, type Request, type Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
    },
    version: process.env.npm_package_version ?? '1.0.0',
  });
});

export const healthRoutes = router;
