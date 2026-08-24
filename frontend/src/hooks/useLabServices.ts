import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labServicesApi } from '../api/services/labServices';

export const useLabServices = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['labServices', params],
    queryFn: () => labServicesApi.getMyServices(params),
  });
};

export const useCreateLabService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => labServicesApi.createMyService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labServices'] });
    },
  });
};

export const useUpdateLabService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => labServicesApi.updateMyService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labServices'] });
    },
  });
};

export const useDeleteLabService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => labServicesApi.deleteMyService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labServices'] });
    },
  });
};

// Admin Hooks
export const useAdminLabServices = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['adminLabServices', params],
    queryFn: () => labServicesApi.getAllServices(params),
  });
};

export const useUpdateLabServiceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => labServicesApi.updateServiceStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLabServices'] });
    },
  });
};
