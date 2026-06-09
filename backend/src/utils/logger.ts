import winston from 'winston';

const sensitiveFields = [
  'password',
  'passwordHash',
  'token',
  'refreshToken',
  'accessToken',
  'mfaSecret',
  'nationalId',
  'authorization',
  'cookie',
  'FIELD_ENCRYPTION_KEY',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

function redactSensitive(info: winston.Logform.TransformableInfo): winston.Logform.TransformableInfo {
  const sanitized = { ...info };
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      (sanitized as Record<string, unknown>)[field] = '[REDACTED]';
    }
  }
  return sanitized;
}

const redactFormat = winston.format((info) => redactSensitive(info));

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  defaultMeta: { service: 'carevo-api' },
  format: winston.format.combine(
    redactFormat(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    isProduction
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, service, stack, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            const stackStr = stack ? `\n${stack as string}` : '';
            return `${timestamp as string} [${service as string}] ${level}: ${message as string}${metaStr}${stackStr}`;
          }),
        ),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

// Stream for Morgan HTTP request logging
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export { logger };
