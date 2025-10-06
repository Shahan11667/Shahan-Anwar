"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  MessageCircle, 
  Plus, 
  User,
  Wifi,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useChatAuth } from '@/hooks/useChat';
import { useSocket } from '@/contexts/SocketContext';

interface Conversation {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastMessage: {
    _id: string;
    content: string;
    messageType: string;
    createdAt: string;
  };
}

interface User {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

interface ConversationListProps {
  onSelectConversation: (userId: string, user: User) => void;
  selectedUserId?: string;
}

export default function ConversationList({ onSelectConversation, selectedUserId }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useChatAuth();
  const { isConnected } = useSocket();

  // Load conversations function
  const loadConversations = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    console.log('🔄 ConversationList - Loading conversations...');
    try {
      const token = localStorage.getItem('chat_token');
      console.log('🔄 ConversationList - Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('🔄 ConversationList - Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔄 ConversationList - Conversations loaded:', data.length);
        setConversations(data);
      } else {
        console.error('🔄 ConversationList - Failed to load conversations:', response.statusText);
        setConversations([]);
      }
    } catch (error) {
      console.error('🔄 ConversationList - Error loading conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load conversations
  useEffect(() => {

    // Load conversations when user is authenticated and not loading
    if (isAuthenticated && user && !authLoading) {
      console.log('🔄 ConversationList - User authenticated, loading conversations');
      loadConversations();
    } else if (!authLoading && !isAuthenticated) {
      console.log('🔄 ConversationList - User not authenticated, clearing conversations');
      setConversations([]);
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading]);

  // Reload conversations when socket reconnects
  useEffect(() => {
    if (isConnected && isAuthenticated && user) {
      console.log('🔄 ConversationList - Socket reconnected, reloading conversations');
      loadConversations(true);
    }
  }, [isConnected, isAuthenticated, user]);

  // Search users
  const handleSearch = async (query: string) => {
    console.log('🔍 Frontend search - Query:', query);
    
    if (query.length < 2) {
      console.log('🔍 Frontend search - Query too short, clearing results');
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem('chat_token');
      console.log('🔍 Frontend search - Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`/api/chat/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('🔍 Frontend search - Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Frontend search - Response data:', data);
        setSearchResults(data);
      } else {
        console.error('🔍 Frontend search - Response not ok:', response.statusText);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('🔍 Frontend search - Error:', error);
      setSearchResults([]);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const handleUserSelect = (selectedUser: User) => {
    onSelectConversation(selectedUser._id, selectedUser);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  if (loading) {
    return (
      <div className="w-80 border-r bg-card h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r bg-card h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadConversations(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-1">
              <Wifi className={`h-3 w-3 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="space-y-2">
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
            />
            
            {searchResults.length > 0 ? (
              <div className="max-h-48 overflow-y-auto">
                <div className="text-xs text-muted-foreground mb-2">
                  Found {searchResults.length} user(s)
                </div>
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center space-x-3 p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {user.isOnline ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                No users found for "{searchQuery}"
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Search for users to start chatting
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Card
                key={conversation._id}
                className={`cursor-pointer transition-colors ${
                  selectedUserId === conversation._id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => onSelectConversation(conversation._id, {
                  _id: conversation._id,
                  username: conversation.username,
                  displayName: conversation.displayName,
                  email: conversation.email,
                  avatar: conversation.avatar,
                  isOnline: conversation.isOnline,
                  lastSeen: conversation.lastMessage.createdAt
                })}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {conversation.displayName}
                        </p>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
