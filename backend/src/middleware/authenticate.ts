import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.js';
import { UnauthorizedError } from '../shared/errors/index.js';
import { logger } from '../utils/logger.js';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Extract access token from HttpOnly cookie
    const token = req.cookies?.accessToken as string | undefined;

    if (!token) {
      throw new UnauthorizedError('Access token is missing.');
    }

    // Verify JWT signature and decode payload
    const payload = verifyAccessToken(token);

    // Attach user to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      laboratoryId: payload.laboratoryId,
      organisationId: payload.organisationId,
      sessionId: payload.sessionId,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    // JWT verification errors (expired, malformed, etc.)
    logger.debug('Authentication failed', { error: (error as Error).message });
    throw new UnauthorizedError('Invalid or expired access token.');
  }
}
