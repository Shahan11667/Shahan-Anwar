import { useState, useEffect, useCallback } from 'react';
import { useService, useServiceMutation } from './useService';
import { chatService } from '@/services';
import { ChatUser, ChatMessage, RegisterData, LoginData } from '@/services/chat.service';
import { PaginationParams, ApiResponse } from '@/services/types';

// Authentication hooks
export function useChatAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loginMutation = useServiceMutation<ApiResponse<{ success: boolean; token?: string; user?: ChatUser }>, LoginData>(
    (credentials) => chatService.login(credentials)
  );

  const registerMutation = useServiceMutation<ApiResponse<{ success: boolean; token?: string; user?: ChatUser }>, RegisterData>(
    (data) => chatService.register(data)
  );

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const isValid = chatService.isAuthenticated();
      setIsAuthenticated(isValid);
      
      if (isValid) {
        const userData = await chatService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginData) => {
    try {
      const result = await loginMutation.mutate(credentials);
      if (result.data?.success && result.data?.token) {
        chatService.setToken(result.data.token);
        setIsAuthenticated(true);
        setUser(result.data.user || null);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }, [loginMutation]);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const result = await registerMutation.mutate(data);
      if (result.data?.success && result.data?.token) {
        chatService.setToken(result.data.token);
        setIsAuthenticated(true);
        setUser(result.data.user || null);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }, [registerMutation]);

  const logout = useCallback(async () => {
    try {
      await chatService.logout();
      chatService.removeToken();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.warn('Logout error:', error);
      // Still clear local state even if server logout fails
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
    loginLoading: loginMutation.loading,
    loginError: loginMutation.error,
    registerLoading: registerMutation.loading,
    registerError: registerMutation.error,
  };
}

// Users hooks
export function useChatUsers(params?: PaginationParams) {
  return useService<ChatUser[]>(() => chatService.getUsers(params));
}

export function useOnlineUsers() {
  return useService<ChatUser[]>(() => chatService.getOnlineUsers());
}

export function useApproveUser() {
  return useServiceMutation<ApiResponse<ChatUser>, string>(
    (userId) => chatService.approveUser(userId)
  );
}

export function useRejectUser() {
  return useServiceMutation<ApiResponse<void>, string>(
    (userId) => chatService.rejectUser(userId)
  );
}

// Messages hooks
export function useChatMessages(roomId: string = 'general', params?: PaginationParams) {
  return useService<ChatMessage[]>(() => chatService.getMessages(roomId, params));
}

export function useSendMessage() {
  return useServiceMutation<ApiResponse<ChatMessage>, {
    content: string;
    messageType?: 'text' | 'image' | 'file';
    roomId?: string;
    replyTo?: string;
  }>(
    (data) => chatService.sendMessage(data)
  );
}

export function useEditMessage() {
  return useServiceMutation<ApiResponse<ChatMessage>, { messageId: string; content: string }>(
    ({ messageId, content }) => chatService.editMessage(messageId, content)
  );
}

export function useDeleteMessage() {
  return useServiceMutation<ApiResponse<void>, string>(
    (messageId) => chatService.deleteMessage(messageId)
  );
}

export function useAddReaction() {
  return useServiceMutation<ApiResponse<ChatMessage>, { messageId: string; emoji: string }>(
    ({ messageId, emoji }) => chatService.addReaction(messageId, emoji)
  );
}

export function useRemoveReaction() {
  return useServiceMutation<ApiResponse<ChatMessage>, { messageId: string; emoji: string }>(
    ({ messageId, emoji }) => chatService.removeReaction(messageId, emoji)
  );
}
