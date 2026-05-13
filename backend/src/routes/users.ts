import { Router } from 'express';
import { prisma } from '../server';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { q, skill, location, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { role: 'JOB_SEEKER', isActive: true };

    if (q) {
      where.OR = [
        { firstName: { contains: q as string, mode: 'insensitive' } },
        { lastName: { contains: q as string, mode: 'insensitive' } },
        { title: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    if (location) where.location = { contains: location as string, mode: 'insensitive' };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        title: true,
        location: true,
        yearsOfExperience: true,
        skills: { include: { skill: { select: { name: true } } } },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count({ where });

    res.json({ users, pagination: { page: parseInt(page as string), limit: parseInt(limit as string), total, pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        title: true,
        bio: true,
        location: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        yearsOfExperience: true,
        skills: { include: { skill: true } },
        experiences: true,
        educations: true,
      },
    });

    if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/skills', authenticate, async (req, res, next) => {
  try {
    const { skillId, proficiency, yearsOfExperience } = req.body;

    const userSkill = await prisma.userSkill.upsert({
      where: { userId_skillId: { userId: req.user!.id, skillId } },
      update: { proficiency, yearsOfExperience },
      create: {
        userId: req.user!.id,
        skillId,
        proficiency,
        yearsOfExperience,
      },
      include: { skill: true },
    });

    res.status(201).json(userSkill);
  } catch (error) {
    next(error);
  }
});

router.delete('/skills/:skillId', authenticate, async (req, res, next) => {
  try {
    await prisma.userSkill.delete({
      where: { userId_skillId: { userId: req.user!.id, skillId: req.params.skillId } },
    });
    res.json({ message: 'Skill removed' });
  } catch (error) {
    next(error);
  }
});

export { router as userRouter };
