import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// @ts-ignore
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinEvent: (eventId: string) => void;
  leaveEvent: (eventId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const token = user?.token;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    if (socketRef.current) return; // Already connected

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Real-time connection established');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Real-time connection lost');
    });

    // Global Alert Listener
    newSocket.on('emergency:alert', (payload: { title: string; message: string; eventId?: string }) => {
      toast.error(payload.title, {
        description: payload.message,
        duration: 10000,
        action: payload.eventId ? {
          label: 'View Event',
          onClick: () => window.location.href = `/events/${payload.eventId}`
        } : undefined
      });
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, user]);

  const joinEvent = useCallback((eventId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_event', eventId);
    }
  }, []);

  const leaveEvent = useCallback((eventId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_event', eventId);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinEvent, leaveEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
