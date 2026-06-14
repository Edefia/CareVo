import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../api/services/billing';

export const useInvoices = (params?: any) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => billingService.getInvoices(params),
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => billingService.getInvoiceById(id),
    enabled: !!id,
  });
};

export const useInitiatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, customerPhone }: { id: string; customerPhone: string }) => billingService.initiatePayment(id, customerPhone),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
