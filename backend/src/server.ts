import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { logger } from './utils/logger.js';
import mongoose from 'mongoose';

let server: import('http').Server;

async function bootstrap() {
  try {
    logger.info(`Starting CareBis Prime backend in ${env.NODE_ENV} mode...`);

    await connectDatabase();
    
    // Sync indexes to clear out old obsolete unique indexes (e.g., phone)
    await mongoose.syncIndexes();
    logger.info('MongoDB indexes synchronized');
    
    // Workers would be started here in production, or in a separate process
    // if (env.NODE_ENV === 'production') { ... }

    server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT}`);
    });

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

bootstrap();

// --- Graceful Shutdown ---
async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      await disconnectDatabase();
      process.exit(0);
    });

    // Force close after 10s
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
