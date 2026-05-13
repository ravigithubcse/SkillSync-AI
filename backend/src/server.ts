import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { redisClient } from './utils/redis';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/users';
import { skillRouter } from './routes/skills';
import { jobRouter } from './routes/jobs';
import { mentorRouter } from './routes/mentor';
import { interviewRouter } from './routes/interviews';
import { resumeRouter } from './routes/resumes';
import { marketRouter } from './routes/market';
import { notificationRouter } from './routes/notifications';
import { messageRouter } from './routes/messages';
import { setupSocketHandlers } from './utils/socket';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export { io };

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Stricter rate limit for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { error: 'AI quota exceeded. Please try again later.' },
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Health check
app.get('/health', async (req, res) => {
  const dbHealthy = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  const redisHealthy = redisClient.isReady;

  res.status(dbHealthy && redisHealthy ? 200 : 503).json({
    status: dbHealthy && redisHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: { database: dbHealthy, redis: redisHealthy },
    version: '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/skills', skillRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/mentor', aiLimiter, mentorRouter);
app.use('/api/interviews', interviewRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/market', marketRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/messages', messageRouter);

// Socket.io setup
setupSocketHandlers(io);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await redisClient.connect();
    logger.info('Redis connected');

    httpServer.listen(PORT, () => {
      logger.info(`🚀 SkillSync API running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  await redisClient.quit();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer();
