import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { followUpService, type CreateFollowUpData } from '../api/services/followUps';

export const useFollowUps = () => {
  return useQuery({
    queryKey: ['follow-ups'],
    queryFn: () => followUpService.getMyFollowUps(),
  });
};

export const useAllFollowUps = (params?: { status?: string }) => {
  return useQuery({
    queryKey: ['all-follow-ups', params],
    queryFn: () => followUpService.getAllFollowUps(params),
  });
};

export const useFollowUpOverviewStats = () => {
  return useQuery({
    queryKey: ['follow-ups-overview-stats'],
    queryFn: () => followUpService.getOverviewStats(),
  });
};

export const useFollowUpPendingCount = () => {
  return useQuery({
    queryKey: ['follow-ups', 'pending-count'],
    queryFn: () => followUpService.getPendingCount(),
  });
};

export const useCreateFollowUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFollowUpData) => followUpService.createFollowUp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
    },
  });
};

export const useAcknowledgeFollowUp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => followUpService.acknowledgeFollowUp(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
    },
  });
};

export const useUpdateFollowUpStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      followUpService.updateFollowUpStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
    },
  });
};
