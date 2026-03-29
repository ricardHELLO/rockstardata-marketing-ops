import { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'crypto';
import { config } from '../config';
import { AppError } from '../lib/errors';

export function internalAuth(req: Request, _res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string | undefined;

  if (!apiKey) {
    throw AppError.unauthorized('Missing x-api-key header');
  }

  const expected = Buffer.from(config.internalApiKey);
  const received = Buffer.from(apiKey);

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw AppError.unauthorized('Invalid API key');
  }

  next();
}

export function adminAuth(req: Request, _res: Response, next: NextFunction): void {
  // Basic auth or query param for V1 simplicity
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      const [, password] = decoded.split(':');
      if (password === config.adminPassword) {
        return next();
      }
    }
  }

  // Also accept query param for direct browser access
  if (req.query.password === config.adminPassword) {
    return next();
  }

  throw AppError.unauthorized('Admin access required');
}
