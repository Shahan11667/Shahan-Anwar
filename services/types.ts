// Common types and interfaces for services

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ServiceError extends Error {
  statusCode?: number;
  isServiceError?: boolean;
}

// Hero section types
export interface HeroData {
  name: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  resumeLink: string;
  socialLinks: {
    github: string;
    linkedin: string;
    email: string;
  };
}

// Project types
export interface ProjectData {
  _id?: string;
  title: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  githubLink: string;
  demoLink: string;
  image: string;
  images?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Contact types
export interface ContactData {
  _id?: string;
  name: string;
  email: string;
  message: string;
  createdAt?: Date | string;
}

export interface ContactInfoData {
  _id?: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  twitter: string;
  instagram: string;
  updatedAt?: Date | string;
}

// User types
export interface UserData {
  _id?: string;
  username: string;
  password: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserData;
  error?: string;
}

// Upload types
export interface UploadResponse {
  url: string;
  type: 'cloudinary' | 'local' | 'data-url';
  filename?: string;
}
