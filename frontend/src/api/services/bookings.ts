import { apiClient } from '../client';

export const bookingService = {
  getBookings: async (params?: Record<string, unknown>) => {
    const response = await apiClient.get('/bookings', { params });
    return response.data;
  },

  getBookingById: async (id: string) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  createBooking: async (data: Record<string, unknown>) => {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  updateBookingStatus: async (id: string, status: string, meetingLink?: string) => {
    const response = await apiClient.patch(`/bookings/${id}/status`, { status, meetingLink });
    return response.data;
  },
};
