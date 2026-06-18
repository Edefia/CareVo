import { apiClient } from '../client';

export const laboratoryService = {
  getLaboratories: async (params?: Record<string, unknown>) => {
    const response = await apiClient.get('/laboratories', { params });
    return response.data;
  },

  getLaboratoryById: async (id: string) => {
    const response = await apiClient.get(`/laboratories/${id}`);
    return response.data;
  },

  createLaboratory: async (data: any) => {
    const response = await apiClient.post('/laboratories', data);
    return response.data;
  },

  updateLaboratory: async (id: string, data: any) => {
    const response = await apiClient.put(`/laboratories/${id}`, data);
    return response.data;
  },

  deleteLaboratory: async (id: string) => {
    const response = await apiClient.delete(`/laboratories/${id}`);
    return response.data;
  }
};
