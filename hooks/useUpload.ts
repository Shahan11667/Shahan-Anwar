import { useCallback } from 'react';
import { useServiceMutation } from './useService';
import { uploadService } from '@/services';
import { UploadResponse, ApiResponse } from '@/services/types';

export function useUploadImage() {
  return useServiceMutation<UploadResponse, File>(
    (file) => uploadService.uploadImage(file)
  );
}

export function useUploadMultipleImages() {
  return useServiceMutation<UploadResponse[], File[]>(
    (files) => uploadService.uploadMultipleImages(files)
  );
}

export function useUploadImageFromUrl() {
  return useServiceMutation<UploadResponse, string>(
    (url) => uploadService.uploadImageFromUrl(url)
  );
}

export function useDeleteImage() {
  return useServiceMutation<ApiResponse<void>, string>(
    (url) => uploadService.deleteImage(url)
  );
}

export function useImageValidation() {
  const validateFile = useCallback((file: File) => {
    return uploadService.validateImageFile(file);
  }, []);

  const getPreview = useCallback((file: File) => {
    return uploadService.getImagePreview(file);
  }, []);

  return {
    validateFile,
    getPreview,
  };
}
