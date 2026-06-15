import apiClient from '../client';
import type { User } from '../../store/auth';

export const authService = {
  login: async (credentials: any) => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data.data; // Assuming response is { status: 'success', data: { user, tokens } }
  },
  register: async (userData: any) => {
    const { data } = await apiClient.post('/auth/register', userData);
    return data.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data.data;
  },
  logout: async () => {
    await apiClient.post('/auth/logout');
  },
  setupMfa: async () => {
    const { data } = await apiClient.post('/auth/mfa/setup');
    return data.data; // { otpauthUrl }
  },
  verifyMfaSetup: async (code: string) => {
    const { data } = await apiClient.post('/auth/mfa/verify-setup', { code });
    return data.data; // { backupCodes }
  },
  verifyMfaLogin: async (token: string, code: string) => {
    const { data } = await apiClient.post('/auth/mfa/verify-login', { token, code });
    return data.data; // { user }
  },
  requestPasswordReset: async (email: string) => {
    const { data } = await apiClient.post('/auth/password-reset/request', { email });
    return data;
  },
  resetPassword: async (passwordData: any) => {
    const { data } = await apiClient.post('/auth/password-reset', passwordData);
    return data;
  }
};
