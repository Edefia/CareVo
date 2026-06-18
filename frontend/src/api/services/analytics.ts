import { apiClient } from '../client';

export const analyticsService = {
  getDashboardMetrics: async () => {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },

  getRevenueChart: async () => {
    const response = await apiClient.get('/analytics/revenue-chart');
    return response.data;
  },

  getBookingStats: async () => {
    const response = await apiClient.get('/analytics/booking-stats');
    return response.data;
  }
};
