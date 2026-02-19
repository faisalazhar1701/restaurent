import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    this.name = 'AppError';
  }
}

const SERVICE_UNAVAILABLE_MSG = 'Service temporarily unavailable. Please try again in a moment.';

/** Map Prisma errors to safe JSON responses; never expose stack traces or raw DB errors. */
function handlePrismaError(err: Prisma.PrismaClientKnownRequestError, res: Response): boolean {
  // Always log the real error for debugging (e.g. in Render logs)
  console.error('[Prisma]', err.code, err.message, err.meta);
  switch (err.code) {
    case 'P1001':
      res.status(503).json({ error: 'Database unavailable. Please try again in a moment.' });
      return true;
    case 'P2021':
      // Table does not exist — migrations not applied
      res.status(503).json({ error: SERVICE_UNAVAILABLE_MSG });
      return true;
    case 'P2002':
      res.status(400).json({ error: 'Resource already exists or conflict' });
      return true;
    case 'P2025':
      res.status(404).json({ error: 'Record not found' });
      return true;
    default:
      res.status(503).json({ error: SERVICE_UNAVAILABLE_MSG });
      return true;
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const payload: { error: string; code?: string } = { error: err.message };
    if (err.code) payload.code = err.code;
    res.status(err.statusCode).json(payload);
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(err, res);
    return;
  }
  // PrismaClientUnknownRequestError, InitializationError, etc. — treat as 503 and log
  const isPrisma = err.constructor.name.startsWith('Prisma');
  if (isPrisma) {
    console.error('[Prisma/DB]', err);
    res.status(503).json({ error: SERVICE_UNAVAILABLE_MSG });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}
