import { apiClient } from '../client';

export const resultService = {
  getResults: async (params?: Record<string, unknown>) => {
    const response = await apiClient.get('/results', { params });
    return response.data;
  },

  getResultById: async (id: string) => {
    const response = await apiClient.get(`/results/${id}`);
    return response.data;
  },

  createResult: async (data: Record<string, unknown>) => {
    const response = await apiClient.post('/results', data);
    return response.data;
  },

  updateResult: async (id: string, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/results/${id}`, data);
    return response.data;
  },
};
