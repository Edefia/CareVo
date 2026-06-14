import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../api/services/bookings';

export const useBookings = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: () => bookingService.getBookings(params),
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getBookingById(id),
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => bookingService.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, meetingLink }: { id: string; status: string; meetingLink?: string }) => 
      bookingService.updateBookingStatus(id, status, meetingLink),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
