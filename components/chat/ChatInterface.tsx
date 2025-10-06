"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useChatAuth } from '@/hooks/useChat';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from '@/components/ui/use-toast';
import ConversationList from './ConversationList';
import PrivateChat from './PrivateChat';

interface User {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

export default function ChatInterface() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { user, logout, loading } = useChatAuth();
  const { isConnected } = useSocket();
  const { toast } = useToast();

  const handleSelectConversation = (userId: string, user: User) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Private Chat</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Chat with other users privately
                </p>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="h-[calc(100vh-80px)] flex">
        {selectedUser ? (
          <PrivateChat 
            selectedUser={selectedUser} 
            onBack={handleBack}
          />
        ) : (
          <ConversationList 
            onSelectConversation={handleSelectConversation}
          />
        )}
      </div>
    </div>
  );
}