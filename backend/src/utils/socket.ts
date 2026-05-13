import { Server, Socket } from 'socket.io';
import { verifyToken } from './jwt';
import { prisma } from '../server';
import { logger } from './logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function setupSocketHandlers(io: Server) {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.userId}`);

    socket.join(`user:${socket.userId}`);

    socket.on('join_interview', (interviewId: string) => {
      socket.join(`interview:${interviewId}`);
      socket.to(`interview:${interviewId}`).emit('peer_joined', { userId: socket.userId });
    });

    socket.on('signal', (data: { interviewId: string; signal: any }) => {
      socket.to(`interview:${data.interviewId}`).emit('signal', {
        userId: socket.userId,
        signal: data.signal,
      });
    });

    socket.on('send_message', async (data: { receiverId: string; content: string }) => {
      try {
        const message = await prisma.message.create({
          data: {
            senderId: socket.userId!,
            receiverId: data.receiverId,
            content: data.content,
          },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
        });

        io.to(`user:${data.receiverId}`).emit('new_message', message);
        socket.emit('message_sent', message);
      } catch (error) {
        logger.error('Socket message error:', error);
      }
    });

    socket.on('typing', (data: { receiverId: string }) => {
      socket.to(`user:${data.receiverId}`).emit('typing', { userId: socket.userId });
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });
  });
}
