import { Router } from 'express';
import { prisma } from '../server';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { unread, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { userId: req.user!.id };
    if (unread === 'true') where.read = false;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      notifications,
      unreadCount: await prisma.notification.count({
        where: { userId: req.user!.id, read: false },
      }),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { read: true },
    });
    res.json({ success: true, updated: notification.count });
  } catch (error) {
    next(error);
  }
});

router.put('/read-all', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export { router as notificationRouter };
