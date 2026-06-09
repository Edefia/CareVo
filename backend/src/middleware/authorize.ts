import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../shared/errors/index.js';
import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import type { Role } from '../shared/constants/roles.js';

// Permission cache TTL: 5 minutes
const PERMISSION_CACHE_TTL = 300;

/**
 * Loads permissions for a role, checking Redis cache first, then MongoDB.
 */
async function loadPermissions(role: string): Promise<string[]> {
  const redis = getRedisClient();
  const cacheKey = `permissions:${role}`;

  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as string[];
  }

  // Load from MongoDB — dynamic import to avoid circular dependency
  const { PermissionModel } = await import('../modules/auth/auth.model.js');
  const permDoc = await PermissionModel.findOne({ role }).lean();

  if (!permDoc) {
    logger.error(`No permission document found for role: ${role}`);
    return [];
  }

  const permissions = permDoc.permissions;

  // Cache in Redis
  await redis.setex(cacheKey, PERMISSION_CACHE_TTL, JSON.stringify(permissions));

  return permissions;
}

/**
 * Authorization middleware factory.
 * Checks if the authenticated user's role has the required permission(s).
 */
export function authorize(...requiredPermissions: string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required.');
    }

    const rolePermissions = await loadPermissions(req.user.role);

    const hasAll = requiredPermissions.every((perm) => rolePermissions.includes(perm));

    if (!hasAll) {
      logger.warn('Authorization denied', {
        userId: req.user.id,
        role: req.user.role,
        required: requiredPermissions,
      });
      throw new ForbiddenError();
    }

    next();
  };
}

/**
 * Helper for service-layer permission checks.
 */
export async function hasPermission(role: Role, permission: string): Promise<boolean> {
  const permissions = await loadPermissions(role);
  return permissions.includes(permission);
}
