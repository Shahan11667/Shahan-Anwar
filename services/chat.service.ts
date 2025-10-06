import { BaseService } from './base.service';
import { ApiResponse, PaginationParams } from './types';

export interface ChatUser {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  isApproved: boolean;
  isOnline: boolean;
  lastSeen: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  sender: ChatUser;
  content: string;
  messageType: 'text' | 'image' | 'file';
  roomId?: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  replyTo?: string;
  reactions: Array<{
    user: string;
    emoji: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: ChatUser;
  error?: string;
}

export class ChatService extends BaseService {
  constructor() {
    super('/api/chat');
  }

  // User authentication
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ChatUser | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }
      
      const response = await this.request<ChatUser>('/auth/me', {
        headers: this.getAuthHeaders()
      });
      return response.data || null;
    } catch (error) {
      console.warn('Failed to get current user:', error);
      return null;
    }
  }

  // User management
  async getUsers(params?: PaginationParams): Promise<ChatUser[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await this.request<ChatUser[]>(`/users${endpoint}`);
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch users:', error);
      return [];
    }
  }

  async getOnlineUsers(): Promise<ChatUser[]> {
    try {
      const response = await this.request<ChatUser[]>('/users/online');
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch online users:', error);
      return [];
    }
  }

  async approveUser(userId: string): Promise<ApiResponse<ChatUser>> {
    return this.request<ChatUser>(`/users/${userId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectUser(userId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${userId}/reject`, {
      method: 'DELETE',
    });
  }

  // Messages
  async getMessages(roomId: string = 'general', params?: PaginationParams): Promise<ChatMessage[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await this.request<ChatMessage[]>(`/messages/${roomId}${endpoint}`, {
        headers: this.getAuthHeaders()
      });
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch messages:', error);
      return [];
    }
  }

  async sendMessage(data: {
    content: string;
    messageType?: 'text' | 'image' | 'file';
    roomId?: string;
    replyTo?: string;
  }): Promise<ApiResponse<ChatMessage>> {
    return this.request<ChatMessage>('/messages', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
  }

  async editMessage(messageId: string, content: string): Promise<ApiResponse<ChatMessage>> {
    return this.request<ChatMessage>(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteMessage(messageId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async addReaction(messageId: string, emoji: string): Promise<ApiResponse<ChatMessage>> {
    return this.request<ChatMessage>(`/messages/${messageId}/reaction`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  }

  async removeReaction(messageId: string, emoji: string): Promise<ApiResponse<ChatMessage>> {
    return this.request<ChatMessage>(`/messages/${messageId}/reaction`, {
      method: 'DELETE',
      body: JSON.stringify({ emoji }),
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('chat_token');
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('chat_token');
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat_token', token);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chat_token');
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

export const chatService = new ChatService();
