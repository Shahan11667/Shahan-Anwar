"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChatAuth } from '@/hooks/useChat';
import { SocketProvider } from '@/contexts/SocketContext';
import ChatInterface from '@/components/chat/ChatInterface';
import DynamicTitle from '@/components/dynamic-title';

export default function ChatPage() {
  const { isAuthenticated, loading, user } = useChatAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/chat/login');
    } else if (!loading && isAuthenticated && user && !user.isApproved) {
      // User is authenticated but not approved
      router.push('/chat/pending');
    }
  }, [isAuthenticated, loading, user, router]);

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

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <SocketProvider>
      <DynamicTitle 
        title="Live Chat" 
        description="Connect with other developers in real-time chat"
      />
      <ChatInterface />
    </SocketProvider>
  );
}
