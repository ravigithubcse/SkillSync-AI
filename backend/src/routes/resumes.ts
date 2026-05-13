import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../server';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(resumes);
  } catch (error) {
    next(error);
  }
});

router.post('/upload', authenticate, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError(400, 'No file uploaded', 'NO_FILE');

    const fileUrl = `/uploads/resumes/${req.user!.id}-${Date.now()}.pdf`;

    // In production, upload to S3/Cloudinary
    // For demo, we store metadata only

    const resume = await prisma.resume.create({
      data: {
        userId: req.user!.id,
        filename: fileUrl,
        originalName: req.file.originalname,
        fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });

    // Trigger async parsing (mock for demo)
    setTimeout(() => analyzeResume(resume.id), 100);

    res.status(201).json(resume);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/analyze', authenticate, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!resume) throw new AppError(404, 'Resume not found', 'NOT_FOUND');

    const analysis = await analyzeResume(resume.id);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await prisma.resume.delete({
      where: { id: req.params.id, userId: req.user!.id },
    });
    res.json({ message: 'Resume deleted' });
  } catch (error) {
    next(error);
  }
});

async function analyzeResume(resumeId: string) {
  try {
    // Mock AI analysis - in production, use OpenAI or custom NLP
    const atsScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const feedback = {
      strengths: [
        'Strong technical skills section',
        'Clear career progression',
        'Quantified achievements',
      ],
      improvements: [
        'Add more keywords from job descriptions',
        'Include metrics for all bullet points',
        'Consider adding a projects section',
      ],
      keywords: ['React', 'Node.js', 'AWS', 'TypeScript', 'PostgreSQL'],
      missingKeywords: ['Docker', 'Kubernetes', 'CI/CD', 'GraphQL'],
      formatScore: Math.floor(Math.random() * 20) + 80,
      contentScore: Math.floor(Math.random() * 20) + 75,
    };

    const updated = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        atsScore,
        feedback: JSON.stringify(feedback),
        parsedData: { analyzed: true, timestamp: new Date().toISOString() },
      },
    });

    return { ...updated, feedback };
  } catch (error) {
    logger.error('Resume analysis error:', error);
    throw error;
  }
}

export { router as resumeRouter };
