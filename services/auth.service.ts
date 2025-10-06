import { BaseService } from './base.service';
import { LoginCredentials, AuthResponse, UserData, ApiResponse } from './types';

export class AuthService extends BaseService {
  constructor() {
    super('/api/auth');
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.data?.token) {
        // Store token in localStorage for client-side persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', response.data.token);
        }
      }

      return response.data || { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      // Remove token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.request<{ valid: boolean }>('/verify');
      return response.data?.valid || false;
    } catch (error) {
      console.warn('Token verification failed:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<UserData | null> {
    try {
      const response = await this.request<UserData>('/me');
      return response.data || null;
    } catch (error) {
      console.warn('Failed to get current user:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth-token');
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth-token');
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  }
}

export const authService = new AuthService();
