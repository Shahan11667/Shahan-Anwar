import { useService, useServiceMutation } from './useService';
import { heroService } from '@/services';
import { HeroData, ApiResponse } from '@/services/types';

export function useHero() {
  return useService<HeroData>(() => heroService.getHeroData());
}

export function useUpdateHero() {
  return useServiceMutation<ApiResponse<HeroData>, Partial<HeroData>>(
    (data) => heroService.updateHeroData(data)
  );
}
