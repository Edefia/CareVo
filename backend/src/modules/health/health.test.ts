import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import mongoose from 'mongoose';
import { getRedisClient } from '../../config/redis.js';

// Mock DB/Redis for basic health check test without spinning up actual servers
vi.mock('../../config/redis.js', () => ({
  getRedisClient: vi.fn().mockReturnValue({
    ping: vi.fn().mockResolvedValue('PONG'),
    call: vi.fn(), // needed by rate-limit-redis
  }),
}));

describe('Health Module', () => {
  it('GET /api/v1/health - should return 200 and healthy status when services are up', async () => {
    // Force mongoose connection state to connected (1) for this test
    Object.defineProperty(mongoose.connection, 'readyState', {
      get: vi.fn().mockReturnValue(1),
      configurable: true,
    });

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.services.database).toBe('connected');
    expect(response.body.services.redis).toBe('connected');
  });

  it('GET /api/v1/health - should return 503 when database is disconnected', async () => {
    // Force mongoose connection state to disconnected (0)
    Object.defineProperty(mongoose.connection, 'readyState', {
      get: vi.fn().mockReturnValue(0),
      configurable: true,
    });

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('error');
    expect(response.body.services.database).toBe('disconnected');
    expect(response.body.services.redis).toBe('connected');
  });
});
