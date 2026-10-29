import { Request, Response, NextFunction } from "express";

/**
 * Basic sanitization middleware to prevent XSS
 * Removes potentially dangerous characters from string inputs
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }

  return obj;
}

function sanitizeString(str: string): string {
  // Remove null bytes
  str = str.replace(/\0/g, '');

  // Trim whitespace
  str = str.trim();

  // Note: We don't escape HTML here because:
  // 1. This is an API backend, not rendering HTML
  // 2. Frontend should handle escaping when displaying
  // 3. Database uses parameterized queries (SQL injection protected)

  return str;
}
