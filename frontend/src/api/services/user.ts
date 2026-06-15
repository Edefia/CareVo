import { apiClient } from '../client';

export const userService = {
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
  }
};
