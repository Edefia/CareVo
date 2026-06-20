import { apiClient } from '../client';

export const userService = {
  // Self-service
  getProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response.data.data || response.data;
  },

  updateProfile: async (data: { firstName?: string; lastName?: string; phone?: string }) => {
    const response = await apiClient.patch('/users/me', data);
    return response.data.data || response.data;
  },

  uploadAvatar: async (avatarBase64: string) => {
    const response = await apiClient.patch('/users/me/avatar', { avatarBase64 });
    return response.data.data || response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.post('/users/me/password', data);
    return response.data.data || response.data;
  },

  // Admin / System
  adminCreateUser: async (data: any) => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  adminUpdateUser: async (id: string, data: any) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  getAllUsers: async (params?: Record<string, unknown>) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  getUserCounts: async () => {
    const response = await apiClient.get('/users/counts');
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  updateUserStatus: async (id: string, isActive: boolean) => {
    const response = await apiClient.patch(`/users/${id}/status`, { isActive });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }
};
