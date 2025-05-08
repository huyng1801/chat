import React, { createContext, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socket = io(SOCKET_URL);

  useEffect(() => {
    if (user) {
      socket.emit('authenticate', user.id);
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
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