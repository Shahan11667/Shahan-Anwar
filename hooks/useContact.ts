import { useService, useServiceMutation } from './useService';
import { contactService } from '@/services';
import { ContactData, ContactInfoData, PaginationParams, ApiResponse } from '@/services/types';

export function useContacts(params?: PaginationParams) {
  return useService<ContactData[]>(() => contactService.getContacts(params));
}

export function useContactInfo() {
  return useService<ContactInfoData>(() => contactService.getContactInfo());
}

export function useSubmitContact() {
  return useServiceMutation<ApiResponse<ContactData>, Omit<ContactData, '_id' | 'createdAt'>>(
    (data) => contactService.submitContact(data)
  );
}

export function useUpdateContactInfo() {
  return useServiceMutation<ApiResponse<ContactInfoData>, Partial<ContactInfoData>>(
    (data) => contactService.updateContactInfo(data)
  );
}

export function useDeleteContact() {
  return useServiceMutation<ApiResponse<void>, string>(
    (id) => contactService.deleteContact(id)
  );
}
