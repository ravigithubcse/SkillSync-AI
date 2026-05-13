import { Router } from 'express';
import { prisma } from '../server';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    // Group by conversation partner
    const conversations = new Map();
    messages.forEach(msg => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;

      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: msg.receiverId === userId && !msg.read ? 1 : 0,
        });
      } else {
        const conv = conversations.get(partnerId);
        if (msg.receiverId === userId && !msg.read) conv.unreadCount++;
      }
    });

    res.json(Array.from(conversations.values()));
  } catch (error) {
    next(error);
  }
});

router.get('/:userId', authenticate, async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user!.id, receiverId: req.params.userId },
          { senderId: req.params.userId, receiverId: req.user!.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    // Mark as read
    await prisma.message.updateMany({
      where: {
        senderId: req.params.userId,
        receiverId: req.user!.id,
        read: false,
      },
      data: { read: true },
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

export { router as messageRouter };
