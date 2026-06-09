import type { Request, Response, NextFunction } from 'express';

/**
 * Recursively strips keys that start with '$' or contain '.' from objects.
 * Prevents NoSQL operator injection ($gt, $where, $regex, etc.)
 */
function sanitize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    // Skip keys starting with $ (NoSQL operators) or containing . (field path injection)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = sanitize(value);
  }
  return sanitized;
}

export function mongoSanitize() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body) req.body = sanitize(req.body);
    if (req.query) {
      // req.query is read-only in Express, so we replace individual properties
      const sanitizedQuery = sanitize(req.query) as Record<string, unknown>;
      for (const key of Object.keys(req.query)) {
        if (!(key in sanitizedQuery)) {
          delete (req.query as Record<string, unknown>)[key];
        }
      }
    }
    if (req.params) {
      const sanitizedParams = sanitize(req.params) as Record<string, string>;
      Object.assign(req.params, sanitizedParams);
    }
    next();
  };
}
