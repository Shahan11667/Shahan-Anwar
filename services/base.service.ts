import { ApiResponse, ServiceError } from './types';

export abstract class BaseService {
  protected baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw this.createServiceError(data.error || 'Request failed', response.status);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      if (error instanceof Error && 'isServiceError' in error) {
        throw error;
      }
      
      throw this.createServiceError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500
      );
    }
  }

  protected createServiceError(message: string, statusCode: number = 500): ServiceError {
    const error = new Error(message) as ServiceError;
    error.statusCode = statusCode;
    error.isServiceError = true;
    return error;
  }

  protected handleError(error: unknown): never {
    if (error instanceof Error && 'isServiceError' in error) {
      throw error;
    }
    
    throw this.createServiceError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500
    );
  }
}
