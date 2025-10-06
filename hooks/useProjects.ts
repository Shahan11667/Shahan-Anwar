import { useService, useServiceMutation } from './useService';
import { projectService } from '@/services';
import { ProjectData, PaginationParams, ApiResponse } from '@/services/types';

export function useProjects(params?: PaginationParams) {
  return useService<ProjectData[]>(() => projectService.getProjects(params));
}

export function useProject(id: string) {
  return useService<ProjectData | null>(() => projectService.getProjectById(id));
}

export function useFeaturedProjects(limit: number = 3) {
  return useService<ProjectData[]>(() => projectService.getFeaturedProjects(limit));
}

export function useSearchProjects(query: string) {
  return useService<ProjectData[]>(
    () => projectService.searchProjects(query),
    { immediate: !!query }
  );
}

export function useCreateProject() {
  return useServiceMutation<ApiResponse<ProjectData>, Omit<ProjectData, '_id' | 'createdAt' | 'updatedAt'>>(
    (data) => projectService.createProject(data)
  );
}

export function useUpdateProject() {
  return useServiceMutation<ApiResponse<ProjectData>, { id: string; data: Partial<ProjectData> }>(
    ({ id, data }) => projectService.updateProject(id, data)
  );
}

export function useDeleteProject() {
  return useServiceMutation<ApiResponse<void>, string>(
    (id) => projectService.deleteProject(id)
  );
}
