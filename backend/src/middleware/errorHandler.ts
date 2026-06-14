import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/index.js';
import { logger } from '../utils/logger.js';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import jwt from 'jsonwebtoken';
const { JsonWebTokenError, TokenExpiredError } = jwt;

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log the error
  if (err instanceof AppError && err.isOperational) {
    logger.warn(err.message, {
      code: err.code,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Application errors (our custom hierarchy)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed.',
        details,
      },
    });
    return;
  }

  // Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Database validation failed.',
        details,
      },
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as unknown as Record<string, unknown>).code === 11000) {
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: 'A record with this information already exists.',
        details: [],
      },
    });
    return;
  }

  // JWT errors
  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token has expired.',
        details: [],
      },
    });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid token.',
        details: [],
      },
    });
    return;
  }

  // Unknown errors — never expose internals in production
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isProduction
        ? 'An unexpected error occurred. Please try again later.'
        : err.message,
      details: isProduction ? [] : [{ stack: err.stack }],
    },
  });
}
