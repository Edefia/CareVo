import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ValidationError } from '../shared/errors/index.js';

type ValidationSource = 'body' | 'params' | 'query';

export function validate(schema: z.AnyZodObject, source: ValidationSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Check if the schema uses the wrapped format (has body, query, or params keys)
    const isWrapped = 'body' in schema.shape || 'query' in schema.shape || 'params' in schema.shape;

    let result;
    if (isWrapped) {
      result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
    } else {
      result = schema.safeParse(req[source]);
    }

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return next(new ValidationError('Validation failed.', details));
    }

    if (isWrapped) {
      // Replace req properties with validated ones
      if (result.data.body !== undefined) req.body = result.data.body;
      if (result.data.query !== undefined) Object.defineProperty(req, 'query', { value: result.data.query, enumerable: true, configurable: true });
      if (result.data.params !== undefined) Object.defineProperty(req, 'params', { value: result.data.params, enumerable: true, configurable: true });
    } else {
      // Replace the source with parsed (and transformed) data
      (req as unknown as Record<string, unknown>)[source] = result.data;
    }
    
    next();
  };
}
