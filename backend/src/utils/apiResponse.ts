import type { Response } from 'express';
import type { IPaginationMeta } from '../shared/types/index.js';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: IPaginationMeta,
): void {
  res.status(statusCode).json({
    success: true,
    data,
    ...(meta && { meta }),
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details: unknown[] = [],
): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}
