import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { AppError } from './errorHandler';
import { prisma } from '../server';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & { id: string };
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'User not found or deactivated', 'UNAUTHORIZED');
    }

    req.user = { ...decoded, id: user.id };
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError(401, 'Invalid or expired token', 'UNAUTHORIZED'));
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions', 'FORBIDDEN'));
    }
    next();
  };
}
