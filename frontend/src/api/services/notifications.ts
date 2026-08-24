import { apiClient } from '../client';

export interface BroadcastPayload {
  modes: string[];
  targetAudience: string;
  userIds?: string[];
  externalContacts?: { name?: string; email?: string; phone?: string }[];
  title: string;
  message: string;
  type?: string;
}

export const notificationService = {
  broadcast: async (data: BroadcastPayload) => {
    const res = await apiClient.post('/notifications/broadcast', data);
    return res.data;
  },

  getNotifications: async (page = 1, limit = 20) => {
    const res = await apiClient.get('/notifications', { params: { page, limit } });
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (id: string) => {
    await apiClient.delete(`/notifications/${id}`);
  }
};
