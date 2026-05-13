import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../server';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { redisClient } from '../utils/redis';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.enum(['JOB_SEEKER', 'RECRUITER']).default('JOB_SEEKER'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, 'Email already registered', 'EMAIL_EXISTS');

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        ...(role === 'RECRUITER' ? {
          recruiterProfile: {
            create: { companyName: 'Your Company' }
          }
        } : {}),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken(user.id);

    await redisClient.setEx(`refresh:${user.id}`, 2592000, refreshToken);

    res.status(201).json({
      user,
      token,
      refreshToken,
      message: 'Registration successful',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatar: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken(user.id);

    await redisClient.setEx(`refresh:${user.id}`, 2592000, refreshToken);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError(401, 'Refresh token required', 'UNAUTHORIZED');

    // In production, verify refresh token properly
    const userId = req.body.userId; // Simplified for demo

    const stored = await redisClient.get(`refresh:${userId}`);
    if (stored !== refreshToken) throw new AppError(401, 'Invalid refresh token', 'UNAUTHORIZED');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) throw new AppError(401, 'User not found', 'UNAUTHORIZED');

    const newToken = generateToken({ userId: user.id, email: user.email, role: user.role });
    res.json({ token: newToken });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        title: true,
        bio: true,
        location: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        yearsOfExperience: true,
        skills: {
          include: { skill: true },
        },
        experiences: true,
        educations: true,
        createdAt: true,
      },
    });

    if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'title', 'bio', 'location', 'linkedinUrl', 'githubUrl', 'portfolioUrl', 'yearsOfExperience', 'avatar'];
    const updates: any = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updates,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        title: true,
        bio: true,
        location: true,
        yearsOfExperience: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };
