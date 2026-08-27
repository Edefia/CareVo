import { apiClient } from '../client';

export const categoryService = {
  getActiveCategories: async (appliesTo?: string) => {
    const params = appliesTo ? { appliesTo } : {};
    const response = await apiClient.get('/categories', { params });
    return response.data;
  },

  getAllCategories: async () => {
    const response = await apiClient.get('/categories/admin');
    return response.data;
  },

  createCategory: async (data: { name: string; description?: string; appliesTo?: string[] }) => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<{ name: string; description: string; isActive: boolean; appliesTo: string[] }>) => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};
