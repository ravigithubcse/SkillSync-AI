import { Router } from 'express';
import { prisma } from '../server';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { category, search, trending } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (search) where.name = { contains: search as string, mode: 'insensitive' };
    if (trending === 'true') where.trend = 'RISING';

    const skills = await prisma.skill.findMany({
      where,
      orderBy: [
        { demandScore: 'desc' },
        { name: 'asc' },
      ],
      include: {
        _count: { select: { users: true } },
      },
    });

    res.json(skills);
  } catch (error) {
    next(error);
  }
});

router.get('/trending', async (req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({
      where: { trend: 'RISING' },
      orderBy: { demandScore: 'desc' },
      take: 10,
    });
    res.json(skills);
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (_req, res) => {
  res.json([
    'PROGRAMMING', 'FRAMEWORK', 'DATABASE', 'CLOUD', 
    'DEVOPS', 'DESIGN', 'MANAGEMENT', 'SOFT_SKILL', 'LANGUAGE', 'OTHER'
  ]);
});

router.get('/:id/market-data', async (req, res, next) => {
  try {
    const data = await prisma.marketData.findMany({
      where: { skillId: req.params.id },
      orderBy: { date: 'desc' },
      take: 30,
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export { router as skillRouter };
