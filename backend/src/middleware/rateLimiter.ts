import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { getRedisClient } from '../config/redis.js';
import { env } from '../config/env.js';

function createRedisStore(prefix: string) {
  if (env.NODE_ENV === 'test') {
    return undefined; // Uses default memory store
  }

  return new RedisStore({
    // Use ioredis sendCommand
    sendCommand: async (...args: string[]) => {
      const client = getRedisClient();
      // rate-limit-redis expects a sendCommand function
      // @ts-expect-error — rate-limit-redis types don't perfectly match ioredis
      return client.call(...args);
    },
    prefix: `rl:${prefix}:`,
  });
}

/**
 * Auth routes: 10 requests per 15 minutes per IP
 * (login, register, password reset)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('auth'),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      details: [],
    },
  },
});

/**
 * Invite acceptance: 5 requests per hour per IP
 */
export const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('invite'),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      details: [],
    },
  },
});

/**
 * File uploads: 20 requests per hour per user
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('upload'),
  keyGenerator: (req, res) => req.user?.id ?? ipKeyGenerator(req, res),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Upload limit exceeded. Please try again later.',
      details: [],
    },
  },
});

/**
 * General API: 200 requests per minute per user
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('general'),
  keyGenerator: (req, res) => req.user?.id ?? ipKeyGenerator(req, res),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
      details: [],
    },
  },
});
