import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthAccountService, type ExportParameter } from '../api/services/healthAccount';

export const useHealthAccount = () => {
  return useQuery({
    queryKey: ['health-account'],
    queryFn: () => healthAccountService.getMyHealthAccount(),
  });
};

export const useExportHistory = () => {
  return useQuery({
    queryKey: ['health-account', 'export-history'],
    queryFn: () => healthAccountService.getExportHistory(),
  });
};

export const useHealthAccountStats = () => {
  return useQuery({
    queryKey: ['health-account-stats'],
    queryFn: () => healthAccountService.getHealthAccountStats(),
  });
};

export const useExportParameters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ resultId, parameters }: { resultId: string; parameters: ExportParameter[] }) =>
      healthAccountService.exportParameters(resultId, parameters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-account'] });
    },
  });
};

export const useRemoveParameter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (parameterKey: string) => healthAccountService.removeParameter(parameterKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-account'] });
    },
  });
};
