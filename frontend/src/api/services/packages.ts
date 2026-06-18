import { apiClient } from '../client';

export const packageService = {
  // Public
  getPackages: async () => {
    const response = await apiClient.get('/packages');
    return response.data;
  },
  
  // Admin
  getAllPackages: async (params?: Record<string, unknown>) => {
    const response = await apiClient.get('/packages/admin', { params });
    return response.data;
  },

  getPackageById: async (id: string) => {
    const response = await apiClient.get(`/packages/${id}`);
    return response.data;
  },

  createPackage: async (data: any) => {
    const response = await apiClient.post('/packages', data);
    return response.data;
  },

  updatePackage: async (id: string, data: any) => {
    const response = await apiClient.put(`/packages/${id}`, data);
    return response.data;
  },

  deletePackage: async (id: string) => {
    const response = await apiClient.delete(`/packages/${id}`);
    return response.data;
  }
};
