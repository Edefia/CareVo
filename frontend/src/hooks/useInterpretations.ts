import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interpretationService } from '../api/services/interpretations';

export const useInterpretations = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ['interpretations', params],
    queryFn: () => interpretationService.getInterpretations(params),
  });
};

export const useInterpretation = (id: string) => {
  return useQuery({
    queryKey: ['interpretation', id],
    queryFn: () => interpretationService.getInterpretationById(id),
    enabled: !!id,
  });
};

export const useCreateInterpretation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => interpretationService.createInterpretation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interpretations'] });
    },
  });
};

export const useUpdateInterpretation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) => 
      interpretationService.updateInterpretation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interpretation', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['interpretations'] });
    },
  });
};

export const usePublishInterpretation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => interpretationService.publishInterpretation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['interpretation', id] });
      queryClient.invalidateQueries({ queryKey: ['interpretations'] });
    },
  });
};
