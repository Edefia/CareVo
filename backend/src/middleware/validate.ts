import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../shared/errors/index.js';

type ValidationSource = 'body' | 'params' | 'query';

export function validate(schema: z.ZodType, source: ValidationSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      throw new ValidationError('Validation failed.', details);
    }

    // Replace the source with parsed (and transformed) data
    (req as unknown as Record<string, unknown>)[source] = result.data;
    next();
  };
}
