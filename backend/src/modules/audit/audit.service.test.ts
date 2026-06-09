import { describe, it, expect, vi } from 'vitest';
import { AuditService } from './audit.service.js';
import { AuditLogModel } from './audit.model.js';

vi.mock('./audit.model.js', () => ({
  AuditLogModel: {
    create: vi.fn(),
    find: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    sort: vi.fn().mockResolvedValue([]),
    countDocuments: vi.fn().mockResolvedValue(0),
  },
}));

describe('Audit Service', () => {
  describe('getLogs', () => {
    it('should build correct query for resourceType', async () => {
      await AuditService.getLogs({ resourceType: 'User' }, 1, 10);
      expect(AuditLogModel.find).toHaveBeenCalledWith(expect.objectContaining({
        resourceType: 'User'
      }));
    });

    it('should build correct query for date range', async () => {
      const startDate = '2026-01-01T00:00:00Z';
      await AuditService.getLogs({ startDate }, 1, 10);
      expect(AuditLogModel.find).toHaveBeenCalledWith(expect.objectContaining({
        createdAt: { $gte: new Date(startDate) }
      }));
    });
  });
});
