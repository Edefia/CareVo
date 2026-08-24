import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface NotificationContextProps {
  socket: Socket | null;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextProps>({
  socket: null,
  isConnected: false,
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Connect to WebSocket server
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    const newSocket = io(backendUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle incoming real-time notifications
    newSocket.on('new_notification', (notification) => {
      // Show toast
      toast.success(notification.title, {
        icon: '🔔',
        description: notification.message,
        duration: 5000,
      });

      // Invalidate react-query cache to re-fetch the paginated list and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, token, queryClient]);

  return (
    <NotificationContext.Provider value={{ socket, isConnected }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useSocket = () => useContext(NotificationContext);
