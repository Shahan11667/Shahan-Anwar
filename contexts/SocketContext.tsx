"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useChatAuth } from '@/hooks/useChat';
import { ChatMessage, ChatUser } from '@/services/chat.service';

interface SocketContextType {
  socket: typeof Socket | null;
  isConnected: boolean;
  onlineUsers: ChatUser[];
  messages: ChatMessage[];
  typingUsers: string[];
  sendMessage: (message: Omit<ChatMessage, '_id' | 'sender' | 'createdAt' | 'updatedAt'>) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  startTyping: (roomId: string) => void;
  stopTyping: (roomId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { isAuthenticated, user, loading } = useChatAuth();

  useEffect(() => {
    // Don't connect until loading is complete
    if (loading) {
      console.log('🔄 SocketContext - Waiting for auth to load...');
      return;
    }

    if (isAuthenticated && user && user.isApproved) {
      console.log('🔌 SocketContext - Connecting to chat server...');
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        path: '/api/socket',
        auth: {
          token: localStorage.getItem('chat_token'),
          user: user
        }
      });

      setSocket(newSocket);

      // Connection events
      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to chat server');
      });

      newSocket.on('disconnect', (reason: any) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
        
        // Auto-reconnect after 3 seconds if it wasn't a manual disconnect
        if (reason !== 'io client disconnect') {
          setTimeout(() => {
            if (isAuthenticated && user && user.isApproved) {
              console.log('🔄 Attempting to reconnect...');
              newSocket.connect();
            }
          }, 3000);
        }
      });

      newSocket.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // User events
      newSocket.on('onlineUsers', (users: ChatUser[]) => {
        setOnlineUsers(users);
      });

      newSocket.on('userJoined', (user: ChatUser) => {
        setOnlineUsers(prev => [...prev.filter(u => u._id !== user._id), user]);
      });

      newSocket.on('userLeft', (userId: string) => {
        setOnlineUsers(prev => prev.filter(u => u._id !== userId));
      });

      // Message events
      newSocket.on('newMessage', (message: ChatMessage) => {
        console.log('📨 Received new message:', message);
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('messageEdited', (message: ChatMessage) => {
        setMessages(prev => 
          prev.map(m => m._id === message._id ? message : m)
        );
      });

      newSocket.on('messageDeleted', (messageId: string) => {
        setMessages(prev => 
          prev.map(m => 
            m._id === messageId ? { ...m, isDeleted: true, deletedAt: new Date().toISOString() } : m
          )
        );
      });

      newSocket.on('messageReacted', (message: ChatMessage) => {
        setMessages(prev => 
          prev.map(m => m._id === message._id ? message : m)
        );
      });

      // Typing events
      newSocket.on('userTyping', (data: { userId: string; username: string; roomId: string }) => {
        setTypingUsers(prev => {
          const key = `${data.userId}-${data.roomId}`;
          if (!prev.includes(key)) {
            return [...prev, key];
          }
          return prev;
        });
      });

      newSocket.on('userStoppedTyping', (data: { userId: string; roomId: string }) => {
        setTypingUsers(prev => {
          const key = `${data.userId}-${data.roomId}`;
          return prev.filter(k => k !== key);
        });
      });

      return () => {
        newSocket.close();
      };
    } else {
      console.log('❌ SocketContext - User not authenticated or not approved, cleaning up...');
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers([]);
      setMessages([]);
      setTypingUsers([]);
    }
  }, [isAuthenticated, user, loading]);

  const sendMessage = (message: Omit<ChatMessage, '_id' | 'sender' | 'createdAt' | 'updatedAt'>) => {
    if (socket) {
      console.log('📤 Sending message:', message);
      socket.emit('sendMessage', message);
    } else {
      console.log('❌ No socket connection available');
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit('joinRoom', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit('leaveRoom', roomId);
    }
  };

  const startTyping = (roomId: string) => {
    if (socket) {
      socket.emit('startTyping', roomId);
    }
  };

  const stopTyping = (roomId: string) => {
    if (socket) {
      socket.emit('stopTyping', roomId);
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (socket) {
      socket.emit('addReaction', { messageId, emoji });
    }
  };

  const removeReaction = (messageId: string, emoji: string) => {
    if (socket) {
      socket.emit('removeReaction', { messageId, emoji });
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    messages,
    typingUsers,
    sendMessage,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    addReaction,
    removeReaction,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
