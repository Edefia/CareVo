import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { laboratoryService } from '../api/services/laboratories';

export const useLaboratories = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['laboratories', params],
    queryFn: () => laboratoryService.getLaboratories(params),
  });
};

export const useLaboratory = (id: string) => {
  return useQuery({
    queryKey: ['laboratory', id],
    queryFn: () => laboratoryService.getLaboratoryById(id),
    enabled: !!id,
  });
};

export const useCreateLaboratory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => laboratoryService.createLaboratory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laboratories'] });
    },
  });
};

export const useUpdateLaboratory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => laboratoryService.updateLaboratory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['laboratory', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['laboratories'] });
    },
  });
};

export const useDeleteLaboratory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => laboratoryService.deleteLaboratory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laboratories'] });
    },
  });
};
