import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './useAuth';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001', {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const sendMessage = useCallback((receiverId: string, content: string) => {
    socketRef.current?.emit('send_message', { receiverId, content });
  }, []);

  const joinInterview = useCallback((interviewId: string) => {
    socketRef.current?.emit('join_interview', interviewId);
  }, []);

  const sendSignal = useCallback((interviewId: string, signal: any) => {
    socketRef.current?.emit('signal', { interviewId, signal });
  }, []);

  return {
    socket: socketRef.current,
    sendMessage,
    joinInterview,
    sendSignal,
  };
}
