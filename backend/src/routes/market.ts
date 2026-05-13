import { Router } from 'express';
import { prisma } from '../server';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/dashboard', async (req, res, next) => {
  try {
    const [trendingSkills, hotJobs, salaryStats, recentData] = await Promise.all([
      prisma.skill.findMany({
        where: { trend: 'RISING' },
        orderBy: { demandScore: 'desc' },
        take: 10,
      }),
      prisma.jobPosting.findMany({
        where: { status: 'ACTIVE' },
        include: {
          recruiter: { select: { companyName: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.marketData.groupBy({
        by: ['date'],
        _avg: { avgSalary: true },
        _sum: { jobCount: true },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      prisma.marketData.findMany({
        orderBy: { date: 'desc' },
        take: 100,
        include: { skill: { select: { name: true, category: true } } },
      }),
    ]);

    res.json({
      trendingSkills,
      hotJobs,
      salaryTrend: salaryStats.reverse(),
      marketActivity: recentData,
      summary: {
        totalActiveJobs: await prisma.jobPosting.count({ where: { status: 'ACTIVE' } }),
        avgMarketSalary: Math.round(recentData.reduce((acc, d) => acc + d.avgSalary, 0) / (recentData.length || 1)),
        topHiringCategory: 'PROGRAMMING', // Calculated dynamically in production
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/salary-by-skill', async (req, res, next) => {
  try {
    const { skillId, location } = req.query;

    const where: any = {};
    if (skillId) where.skillId = skillId as string;
    if (location) where.location = location as string;

    const data = await prisma.marketData.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 90,
      include: { skill: { select: { name: true } } },
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/demand-heatmap', async (req, res, next) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { demandScore: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        category: true,
        demandScore: true,
        trend: true,
        avgSalary: true,
      },
    });

    res.json(skills);
  } catch (error) {
    next(error);
  }
});

export { router as marketRouter };
