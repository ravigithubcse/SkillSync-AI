import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const jobSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  location: z.string().min(1),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  remote: z.boolean().default(false),
  requirements: z.array(z.object({
    skillId: z.string(),
    required: z.boolean().default(true),
    minYears: z.number().default(0),
  })).optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const { search, location, type, remote, skill, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { status: 'ACTIVE' };

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (type) where.type = type;
    if (remote === 'true') where.remote = true;

    const jobs = await prisma.jobPosting.findMany({
      where,
      include: {
        recruiter: { select: { companyName: true } },
        requirements: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.jobPosting.count({ where });

    res.json({
      jobs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const job = await prisma.jobPosting.findUnique({
      where: { id: req.params.id },
      include: {
        recruiter: { select: { companyName: true, companySize: true, industry: true } },
        requirements: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) throw new AppError(404, 'Job not found', 'NOT_FOUND');

    await prisma.jobPosting.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
    });

    res.json(job);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, authorize('RECRUITER', 'ADMIN'), validate(jobSchema), async (req, res, next) => {
  try {
    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!recruiter) throw new AppError(400, 'Recruiter profile not found', 'NOT_FOUND');

    const { requirements, ...jobData } = req.body;

    const job = await prisma.jobPosting.create({
      data: {
        ...jobData,
        recruiterId: recruiter.id,
        requirements: requirements ? {
          create: requirements,
        } : undefined,
      },
      include: {
        requirements: { include: { skill: true } },
        recruiter: true,
      },
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/apply', authenticate, authorize('JOB_SEEKER'), async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const userId = req.user!.id;

    const existing = await prisma.jobApplication.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });

    if (existing) throw new AppError(409, 'Already applied to this job', 'ALREADY_APPLIED');

    // Calculate match score based on skills
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
    });

    const jobReqs = await prisma.jobRequirement.findMany({
      where: { jobId },
      include: { skill: true },
    });

    let matchScore = 0;
    if (jobReqs.length > 0) {
      const matched = jobReqs.filter(req => 
        userSkills.some(us => us.skillId === req.skillId)
      );
      matchScore = Math.round((matched.length / jobReqs.length) * 100);
    }

    const application = await prisma.jobApplication.create({
      data: {
        userId,
        jobId,
        coverLetter: req.body.coverLetter,
        matchScore,
      },
      include: {
        job: { select: { title: true, companyName: true } },
      },
    });

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
});

router.get('/applications/my', authenticate, authorize('JOB_SEEKER'), async (req, res, next) => {
  try {
    const applications = await prisma.jobApplication.findMany({
      where: { userId: req.user!.id },
      include: {
        job: {
          select: {
            title: true,
            location: true,
            type: true,
            salaryMin: true,
            salaryMax: true,
            recruiter: { select: { companyName: true } },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json(applications);
  } catch (error) {
    next(error);
  }
});

export { router as jobRouter };
