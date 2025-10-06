import { BaseService } from './base.service';
import { ContactData, ContactInfoData, ApiResponse, PaginationParams, PaginatedResponse } from './types';

export class ContactService extends BaseService {
  constructor() {
    super('/api/contact');
  }

  async submitContact(data: Omit<ContactData, '_id' | 'createdAt'>): Promise<ApiResponse<ContactData>> {
    return this.request<ContactData>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContacts(params?: PaginationParams): Promise<ContactData[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await this.request<ContactData[]>(endpoint);
      return response.data || [];
    } catch (error) {
      console.warn('Failed to fetch contacts:', error);
      return [];
    }
  }

  async deleteContact(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  async getContactInfo(): Promise<ContactInfoData> {
    try {
      const response = await this.request<ContactInfoData>('/info');
      return response.data || this.getDefaultContactInfo();
    } catch (error) {
      console.warn('Failed to fetch contact info, using default:', error);
      return this.getDefaultContactInfo();
    }
  }

  async updateContactInfo(data: Partial<ContactInfoData>): Promise<ApiResponse<ContactInfoData>> {
    return this.request<ContactInfoData>('/info', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  private getDefaultContactInfo(): ContactInfoData {
    return {
      email: "shahananwar39@gmail.com",
      phone: "+92 300 1234567",
      location: "Karachi, Pakistan",
      linkedin: "https://linkedin.com/in/shahananwar",
      github: "https://github.com/shahananwar39",
      twitter: "https://twitter.com/shahananwar",
      instagram: "https://instagram.com/shahananwar"
    };
  }
}

export const contactService = new ContactService();
