import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory rate limiter for MVP.
 * Limits requests per userId per window.
 */
const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).userId || req.ip || 'anonymous';
    const key = `${userId}:${req.path}`;
    const now = Date.now();

    const record = requests.get(key);
    if (!record || now > record.resetAt) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please wait.',
        retryAfter: Math.ceil((record.resetAt - now) / 1000),
      });
    }

    record.count++;
    next();
  };
}
