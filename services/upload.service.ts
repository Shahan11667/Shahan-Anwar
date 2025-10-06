import { BaseService } from './base.service';
import { UploadResponse, ApiResponse } from './types';

export class UploadService extends BaseService {
  constructor() {
    super('/api/upload-hybrid');
  }

  async uploadImage(file: File): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        url: data.url,
        type: data.type || 'local',
        filename: data.filename,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw this.createServiceError(
        error instanceof Error ? error.message : 'Upload failed',
        500
      );
    }
  }

  async uploadMultipleImages(files: File[]): Promise<UploadResponse[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Multiple upload error:', error);
      throw this.createServiceError(
        error instanceof Error ? error.message : 'Multiple upload failed',
        500
      );
    }
  }

  async uploadImageFromUrl(url: string): Promise<UploadResponse> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch image from URL');
      }

      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });
      
      return await this.uploadImage(file);
    } catch (error) {
      console.error('URL upload error:', error);
      throw this.createServiceError(
        error instanceof Error ? error.message : 'URL upload failed',
        500
      );
    }
  }

  async deleteImage(url: string): Promise<ApiResponse<void>> {
    try {
      // For now, we'll just return success as we don't have a delete endpoint
      // In a real app, you'd call the delete endpoint here
      return { success: true };
    } catch (error) {
      console.error('Delete image error:', error);
      throw this.createServiceError(
        error instanceof Error ? error.message : 'Delete failed',
        500
      );
    }
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File must be an image (JPEG, PNG, GIF, or WebP)' };
    }

    return { valid: true };
  }

  getImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }
}

export const uploadService = new UploadService();
