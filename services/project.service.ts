import { BaseService } from './base.service';
import { ProjectData, ApiResponse, PaginationParams, PaginatedResponse } from './types';

export class ProjectService extends BaseService {
  constructor() {
    super('/api/projects');
  }

  async getProjects(params?: PaginationParams): Promise<ProjectData[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await this.request<ProjectData[]>(endpoint);
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch projects:', error);
      return [];
    }
  }

  async getProjectById(id: string): Promise<ProjectData | null> {
    try {
      const response = await this.request<ProjectData>(`/${id}`);
      return response.data || null;
    } catch (error) {
      console.warn(`Failed to fetch project ${id}:`, error);
      return null;
    }
  }

  async createProject(data: Omit<ProjectData, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ProjectData>> {
    return this.request<ProjectData>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<ProjectData>): Promise<ApiResponse<ProjectData>> {
    return this.request<ProjectData>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  async getFeaturedProjects(limit: number = 3): Promise<ProjectData[]> {
    try {
      const projects = await this.getProjects({ limit, sortBy: 'createdAt', sortOrder: 'desc' });
      return projects.slice(0, limit);
    } catch (error) {
      console.warn('Failed to fetch featured projects:', error);
      return [];
    }
  }

  async searchProjects(query: string): Promise<ProjectData[]> {
    try {
      const projects = await this.getProjects();
      const searchTerm = query.toLowerCase();
      
      return projects.filter(project => 
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm) ||
        project.techStack.some(tech => tech.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.warn('Failed to search projects:', error);
      return [];
    }
  }
}

export const projectService = new ProjectService();
