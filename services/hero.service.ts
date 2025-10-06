import { BaseService } from './base.service';
import { HeroData, ApiResponse } from './types';

export class HeroService extends BaseService {
  constructor() {
    super('/api/hero');
  }

  async getHeroData(): Promise<HeroData> {
    try {
      const response = await this.request<HeroData>('');
      return response.data || this.getDefaultHeroData();
    } catch (error) {
      console.warn('Failed to fetch hero data, using default:', error);
      return this.getDefaultHeroData();
    }
  }

  async updateHeroData(data: Partial<HeroData>): Promise<ApiResponse<HeroData>> {
    return this.request<HeroData>('', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  private getDefaultHeroData(): HeroData {
    return {
      name: "Shahan Anwar",
      title: "Full Stack Developer | Next.js Expert",
      subtitle: "Building Digital Solutions",
      description: "Professional Full Stack Developer specializing in Next.js, React, TypeScript, and mobile app development. Based in Karachi, Pakistan.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face",
      resumeLink: "#",
      socialLinks: {
        github: "https://github.com/shahananwar39",
        linkedin: "https://linkedin.com/in/shahananwar",
        email: "shahananwar39@gmail.com"
      }
    };
  }
}

export const heroService = new HeroService();
