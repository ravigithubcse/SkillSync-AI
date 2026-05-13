import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Error:', { error: err.message, stack: err.stack, path: req.path });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.message,
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: 'Database error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Operation failed',
    });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
}
