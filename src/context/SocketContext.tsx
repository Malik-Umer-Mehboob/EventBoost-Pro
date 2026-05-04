/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const SOCKET_URL = import.meta.env.VITE_API_URL;

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
      toast.custom((t) => (
        <div className="alert-banner-realtime shadow-2xl min-w-[320px] md:min-w-[400px] flex-col !items-start gap-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#E24B4A]"></div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E24B4A]/20 rounded-lg">
              <span className="animate-pulse">🚨</span>
            </div>
            <h4 className="font-black text-sm tracking-tight">{payload.title}</h4>
          </div>
          <p className="text-[11px] font-bold opacity-80 leading-relaxed pl-11">{payload.content}</p>
          {payload.eventId && (
            <button 
              onClick={() => {
                window.location.href = `/events/${payload.eventId}`;
                toast.dismiss(t);
              }}
              className="mt-2 ml-11 px-4 py-1.5 bg-[#E24B4A] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-rose-500/20"
            >
              Intercept Event
            </button>
          )}
        </div>
      ), {
        duration: 15000,
        position: 'top-center'
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

