import { AuditLogModel } from './audit.model.js';
import { UserModel } from '../auth/auth.model.js';
import type { IAuditLogEntry } from '../../shared/types/index.js';
import { logger } from '../../utils/logger.js';
import mongoose from 'mongoose';
import { getPaginationOptions, createPaginatedResponse } from '../../utils/pagination.js';

export class AuditService {
  /**
   * Creates an immutable audit log entry.
   * This is write-only — no update or delete methods exist by design.
   * Failures are logged but never block the calling operation.
   */
  static async log(entry: IAuditLogEntry): Promise<void> {
    try {
      await AuditLogModel.create({
        actorId: new mongoose.Types.ObjectId(entry.actorId),
        actorRole: entry.actorRole,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        previousState: entry.previousState ?? null,
        newState: entry.newState ?? null,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        sessionId: entry.sessionId,
        success: entry.success,
        failureReason: entry.failureReason ?? null,
      });
    } catch (error) {
      // Audit log failures must never block the main operation
      // but must always be logged for investigation
      logger.error('Failed to create audit log entry', {
        error: (error as Error).message,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getLogs(filters: any, page: number, limit: number) {
    const { skip, limit: limitNum } = getPaginationOptions(page, limit);
    const query: any = {};

    if (filters.actorId) query.actorId = filters.actorId;
    if (filters.actorRole) query.actorRole = filters.actorRole;
    if (filters.action) query.action = filters.action;
    if (filters.resourceType) query.resourceType = filters.resourceType;
    if (filters.resourceId) query.resourceId = filters.resourceId;
    
    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { action: searchRegex },
        { resourceType: searchRegex },
        { ipAddress: searchRegex },
        { actorRole: searchRegex },
      ];
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    // Ensure UserModel is registered for populate
    void UserModel;

    const [logs, total] = await Promise.all([
      AuditLogModel.find(query)
        .populate({ path: 'actorId', select: 'firstName lastName email name' })
        .skip(skip)
        .limit(limitNum)
        .sort({ timestamp: -1 }),
      AuditLogModel.countDocuments(query),
    ]);

    return createPaginatedResponse(logs, page, limitNum, total);
  }
}
