import { useState, useEffect, useCallback } from 'react';
import { useServiceMutation } from './useService';
import { authService } from '@/services';
import { LoginCredentials, AuthResponse, UserData } from '@/services/types';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const loginMutation = useServiceMutation<AuthResponse, LoginCredentials>(
    (credentials) => authService.login(credentials)
  );

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const isValid = await authService.verifyToken();
      setIsAuthenticated(isValid);
      
      if (isValid) {
        const userData = await authService.getCurrentUser();
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

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const result = await loginMutation.mutate(credentials);
      if (result.success) {
        setIsAuthenticated(true);
        setUser(result.user || null);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }, [loginMutation]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
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
    logout,
    checkAuth,
    loginLoading: loginMutation.loading,
    loginError: loginMutation.error,
  };
}
