import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export const useLaboratories = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['laboratories', params],
    queryFn: async () => {
      const response = await apiClient.get('/laboratories', { params });
      return response.data;
    },
  });
};
