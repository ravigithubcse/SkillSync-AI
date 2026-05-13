import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './errorHandler';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      const message = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      next(new AppError(400, message || 'Validation failed', 'VALIDATION_ERROR'));
    }
  };
}
