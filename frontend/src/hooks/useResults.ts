import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resultService } from '../api/services/results';

export const useResults = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['results', params],
    queryFn: () => resultService.getResults(params),
  });
};

export const useResult = (id: string | undefined) => {
  return useQuery({
    queryKey: ['result', id],
    queryFn: () => id ? resultService.getResultById(id) : null,
    enabled: !!id,
  });
};

export const useCreateResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => resultService.createResult(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
};

export const useUpdateResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => 
      resultService.updateResult(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['result', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
};

export const useSubmitForApproval = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      resultService.submitForApproval(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['result', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useUpdateResultStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      resultService.updateResultStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['result', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });
};
