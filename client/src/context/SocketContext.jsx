import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      newSocket.emit('setup', user);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('online users', (users) => {
      setOnlineUsers(users || []);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [user, token]);

  const joinChat = (conversationId) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('join chat', conversationId);
    }
  };

  const leaveChat = (conversationId) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('leave chat', conversationId);
    }
  };

  const emitNewMessage = (message) => {
    if (socketRef.current && message) {
      socketRef.current.emit('new message', message);
    }
  };

  const emitTyping = (conversationId) => {
    if (socketRef.current && conversationId && user) {
      socketRef.current.emit('typing', { room: conversationId, user });
    }
  };

  const emitStopTyping = (conversationId) => {
    if (socketRef.current && conversationId && user) {
      socketRef.current.emit('stop typing', { room: conversationId, user });
    }
  };

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.includes(userId.toString());
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        isUserOnline,
        joinChat,
        leaveChat,
        emitNewMessage,
        emitTyping,
        emitStopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
