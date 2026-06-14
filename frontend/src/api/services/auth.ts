import apiClient from '../client';
import type { User } from '../../store/auth';

export const authService = {
  login: async (credentials: any) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data.data; // Assuming response is { status: 'success', data: { user, tokens } }
  },
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data.data;
  },
  logout: async () => {
    await apiClient.post('/auth/logout');
  }
};
