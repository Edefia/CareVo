import apiClient from '../client';

export const billingService = {
  getInvoices: async (params?: any) => {
    const { data } = await apiClient.get('/billing/invoices', { params });
    return data.data || data;
  },
  getInvoiceById: async (id: string) => {
    const { data } = await apiClient.get(`/billing/invoices/${id}`);
    return data.data;
  },
  initiatePayment: async (id: string, customerPhone: string, channel: string) => {
    const { data } = await apiClient.post(`/billing/invoices/${id}/pay`, { customerPhone, channel });
    return data.data;
  }
};
