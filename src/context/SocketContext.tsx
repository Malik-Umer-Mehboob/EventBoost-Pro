/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

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
        queueMicrotask(() => {
          setSocket(null);
          setIsConnected(false);
        });
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
    
    // Use queueMicrotask to avoid synchronous setState warning during effect execution
    queueMicrotask(() => {
      setSocket(newSocket);
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Real-time connection established');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Real-time connection lost');
    });

    // Global Alert Listener
    newSocket.on('emergency_alert', (payload: { title: string; content: string; eventId?: string }) => {
      console.log('🚨 Received Emergency Alert:', payload);
      toast.error(payload.title, {
        description: payload.content,
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
      queueMicrotask(() => {
        setSocket(null);
        setIsConnected(false);
      });
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

