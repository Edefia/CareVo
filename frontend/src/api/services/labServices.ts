import { apiClient } from '../client';

export const labServicesApi = {
  getMyServices: async (params?: Record<string, unknown>) => {
    const response = await apiClient.get('/laboratories/my/services', { params });
    return response.data;
  },

  createMyService: async (data: any) => {
    const response = await apiClient.post('/laboratories/my/services', data);
    return response.data;
  },

  updateMyService: async (id: string, data: any) => {
    const response = await apiClient.put(`/laboratories/my/services/${id}`, data);
    return response.data;
  },

  deleteMyService: async (id: string) => {
    const response = await apiClient.delete(`/laboratories/my/services/${id}`);
    return response.data;
  },

  // Admin routes
  getAllServices: async (params?: Record<string, unknown>) => {
    const response = await apiClient.get('/laboratories/services', { params });
    return response.data;
  },

  updateServiceStatus: async (id: string, data: any) => {
    const response = await apiClient.put(`/laboratories/services/${id}/status`, data);
    return response.data;
  }
};
