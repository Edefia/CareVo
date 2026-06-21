import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, type BroadcastPayload } from '../api/services/notifications';
import toast from 'react-hot-toast';

export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['notifications', page, limit],
    queryFn: () => notificationService.getNotifications(page, limit),
    refetchInterval: false, // Relies on WebSockets for invalidation
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    },
  });
}

export function useBroadcastNotification() {
  return useMutation({
    mutationFn: (data: BroadcastPayload) => notificationService.broadcast(data),
    onSuccess: () => {
      toast.success('Broadcast triggered successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to send broadcast');
    }
  });
}
