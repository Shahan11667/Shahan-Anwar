import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '@/services/types';

interface UseServiceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UseServiceOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useService<T>(
  serviceFunction: () => Promise<T>,
  options: UseServiceOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseServiceState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await serviceFunction();
      setState({
        data: result,
        loading: false,
        error: null,
        success: true,
      });
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
      onError?.(errorMessage);
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    reset,
  };
}

export function useServiceMutation<T, P = any>(
  serviceFunction: (params: P) => Promise<T>,
  options: UseServiceOptions = {}
) {
  const { onSuccess, onError } = options;
  
  const [state, setState] = useState<UseServiceState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await serviceFunction(params);
      setState({
        data: result,
        loading: false,
        error: null,
        success: true,
      });
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
      onError?.(errorMessage);
      throw error;
    }
  }, [serviceFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}
