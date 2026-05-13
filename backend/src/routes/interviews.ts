import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const scheduleSchema = z.object({
  type: z.enum(['TECHNICAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'CODING', 'HR']),
  scheduledAt: z.string().datetime(),
  peerId: z.string().optional(),
  notes: z.string().optional(),
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const interviews = await prisma.mockInterview.findMany({
      where: {
        OR: [
          { userId: req.user!.id },
          { peerId: req.user!.id },
        ],
      },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
        peer: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });
    res.json(interviews);
  } catch (error) {
    next(error);
  }
});

router.post('/schedule', authenticate, validate(scheduleSchema), async (req, res, next) => {
  try {
    const { type, scheduledAt, peerId, notes } = req.body;

    if (peerId) {
      const peer = await prisma.user.findUnique({ where: { id: peerId } });
      if (!peer) throw new AppError(404, 'Peer not found', 'NOT_FOUND');
    }

    const interview = await prisma.mockInterview.create({
      data: {
        userId: req.user!.id,
        peerId,
        type,
        scheduledAt: new Date(scheduledAt),
        notes,
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        peer: { select: { firstName: true, lastName: true } },
      },
    });

    res.status(201).json(interview);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/feedback', authenticate, async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;

    const interview = await prisma.mockInterview.findFirst({
      where: {
        id: req.params.id,
        OR: [{ userId: req.user!.id }, { peerId: req.user!.id }],
      },
    });

    if (!interview) throw new AppError(404, 'Interview not found', 'NOT_FOUND');

    const updated = await prisma.mockInterview.update({
      where: { id: req.params.id },
      data: {
        rating,
        feedback: feedback || {},
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.get('/peers/match', authenticate, async (req, res, next) => {
  try {
    const { skill } = req.query;

    const userSkills = await prisma.userSkill.findMany({
      where: { userId: req.user!.id },
      select: { skillId: true },
    });

    const skillIds = userSkills.map(s => s.skillId);
    if (skill) skillIds.push(skill as string);

    const matches = await prisma.user.findMany({
      where: {
        id: { not: req.user!.id },
        role: 'JOB_SEEKER',
        isActive: true,
        skills: {
          some: {
            skillId: { in: skillIds },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        title: true,
        yearsOfExperience: true,
        skills: {
          include: { skill: { select: { name: true } } },
          take: 5,
        },
      },
      take: 10,
    });

    // Calculate match scores
    const scoredMatches = matches.map(match => {
      const matchSkillIds = match.skills.map(s => s.skillId);
      const commonSkills = skillIds.filter(id => matchSkillIds.includes(id));
      const score = Math.round((commonSkills.length / skillIds.length) * 100);
      return { ...match, matchScore: score };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json(scoredMatches);
  } catch (error) {
    next(error);
  }
});

export { router as interviewRouter };
