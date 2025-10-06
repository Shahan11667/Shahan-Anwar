"use client"

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  ArrowLeft, 
  User,
  Wifi,
  Clock
} from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useChatAuth } from '@/hooks/useChat';

interface User {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    displayName: string;
    avatar: string;
    role: string;
  };
  recipient?: {
    _id: string;
  };
  content: string;
  messageType: string;
  conversationType: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  replyTo?: any;
  reactions: any[];
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

interface PrivateChatProps {
  selectedUser: User;
  onBack: () => void;
}

export default function PrivateChat({ selectedUser, onBack }: PrivateChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isConnected, socket } = useSocket();
  const { user: currentUser } = useChatAuth();

  // Load messages
  const loadMessages = async (pageNum: number = 1, append: boolean = false) => {
    try {
      const token = localStorage.getItem('chat_token');
      const response = await fetch(`/api/chat/messages/private?userId=${selectedUser._id}&page=${pageNum}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (append) {
          setMessages(prev => [...data.messages, ...prev]);
        } else {
          setMessages(data.messages);
        }
        setHasMore(data.hasMore);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial messages
  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      loadMessages(1, false);
    }
  }, [selectedUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle new messages from socket
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      console.log('📨 PrivateChat received message:', message);
      console.log('📨 Selected user ID:', selectedUser._id);
      console.log('📨 Current user ID:', currentUser?._id);
      console.log('📨 Message sender ID:', message.sender._id);
      console.log('📨 Message conversation type:', message.conversationType);
      
      // Only add messages for this conversation
      const isFromSelectedUser = message.sender._id === selectedUser._id;
      const isFromCurrentUser = message.sender._id === currentUser?._id;
      const isPrivateMessage = message.conversationType === 'private';
      const isToSelectedUser = message.recipient?._id === selectedUser._id;
      const isToCurrentUser = message.recipient?._id === currentUser?._id;
      
      // Message is for this conversation if:
      // 1. It's from selected user to current user, OR
      // 2. It's from current user to selected user, OR
      // 3. It's a private message between these two users
      const isForThisConversation = isPrivateMessage && (
        (isFromSelectedUser && isToCurrentUser) ||
        (isFromCurrentUser && isToSelectedUser)
      );
      
      console.log('📊 Message filter check:', {
        isFromSelectedUser,
        isFromCurrentUser,
        isPrivateMessage,
        isToSelectedUser,
        isToCurrentUser,
        isForThisConversation
      });
      
      if (isForThisConversation) {
        console.log('✅ Adding message to conversation');
        setMessages(prev => [...prev, message]);
      } else {
        console.log('❌ Message not for this conversation');
      }
    };

    // Listen for new messages from SocketContext
    if (socket) {
      console.log('🔌 PrivateChat setting up socket listener');
      socket.on('newMessage', handleNewMessage);
      return () => {
        console.log('🔌 PrivateChat removing socket listener');
        socket.off('newMessage', handleNewMessage);
      };
    } else {
      console.log('❌ PrivateChat: No socket available');
    }
  }, [selectedUser._id, currentUser?._id, socket]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    const messageData = {
      content: newMessage.trim(),
      messageType: 'text' as const,
      recipientId: selectedUser._id,
      conversationType: 'private' as const
    };

    sendMessage(messageData as any);
    setNewMessage('');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loading) {
      loadMessages(page + 1, true);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <CardHeader className="border-b bg-card">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            {selectedUser.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{selectedUser.displayName}</CardTitle>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground truncate">{selectedUser.email}</p>
              <div className="flex items-center space-x-1">
                <Wifi className={`h-3 w-3 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreMessages}
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load more messages'}
            </Button>
          )}
          
          {messages.map((message, index) => {
            const isOwn = message.sender._id === currentUser?._id;
            const showDate = index === 0 || 
              formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);
            
            return (
              <div key={message._id}>
                {showDate && (
                  <div className="text-center my-4">
                    <Badge variant="secondary" className="text-xs">
                      {formatDate(message.createdAt)}
                    </Badge>
                  </div>
                )}
                
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    isOwn 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <CardContent className="border-t bg-card p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={!isConnected}
            className="flex-1"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newMessage.trim() || !isConnected}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </div>
  );
}
