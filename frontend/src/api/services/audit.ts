import { apiClient } from '../client';

export const auditService = {
  getAuditLogs: async (params?: Record<string, unknown>) => {
    const response = await apiClient.get('/audit', { params });
    return response.data;
  }
};
