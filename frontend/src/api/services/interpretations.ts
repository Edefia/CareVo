import { apiClient } from '../client';

export const interpretationService = {
  getInterpretations: async (params?: Record<string, unknown>) => {
    const response = await apiClient.get('/interpretations', { params });
    return response.data;
  },

  getInterpretationById: async (id: string) => {
    const response = await apiClient.get(`/interpretations/${id}`);
    return response.data;
  },

  createInterpretation: async (data: Record<string, unknown>) => {
    const response = await apiClient.post('/interpretations', data);
    return response.data;
  },

  updateInterpretation: async (id: string, data: Record<string, unknown>) => {
    const response = await apiClient.patch(`/interpretations/${id}`, data);
    return response.data;
  },

  publishInterpretation: async (id: string) => {
    const response = await apiClient.post(`/interpretations/${id}/publish`);
    return response.data;
  },
};
