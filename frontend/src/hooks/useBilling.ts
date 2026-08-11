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
    mutationFn: ({ id, email, callbackUrl }: { id: string; email: string; callbackUrl?: string }) => billingService.initiatePayment(id, email, callbackUrl),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

// Admin Hooks
export const useBillingStats = () => {
  return useQuery({
    queryKey: ['billing-stats'],
    queryFn: billingService.getBillingStats,
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billingService.verifyPayment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    },
  });
};

export const useRecordManualPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentMethod, referenceNote }: { id: string; paymentMethod: string; referenceNote: string }) => 
      billingService.recordManualPayment(id, paymentMethod, referenceNote),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    },
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => billingService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    },
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, referenceId, paymentGateway }: { id: string; status: string; referenceId?: string; paymentGateway?: string }) => 
      billingService.updateInvoiceStatus(id, status, referenceId, paymentGateway),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    },
  });
};
