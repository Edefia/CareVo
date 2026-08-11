import { apiClient } from '../client';

export const billingService = {
  getInvoices: async (params?: Record<string, unknown>) => {
    const response = await apiClient.get('/billing', { params });
    return response.data;
  },

  getInvoiceById: async (id: string) => {
    const response = await apiClient.get(`/billing/${id}`);
    return response.data;
  },

  /**
   * Initialize a Paystack payment for an invoice.
   * Returns { authorization_url, access_code, reference }
   */
  initiatePayment: async (id: string, email: string, callbackUrl?: string) => {
    const response = await apiClient.post(`/billing/${id}/pay`, { email, callbackUrl });
    return response.data;
  },

  // Admin / System endpoints
  getBillingStats: async () => {
    const response = await apiClient.get('/billing/stats');
    return response.data;
  },

  verifyPayment: async (id: string) => {
    const response = await apiClient.post(`/billing/${id}/verify`);
    return response.data;
  },

  recordManualPayment: async (id: string, paymentMethod: string, referenceNote: string) => {
    const response = await apiClient.post(`/billing/${id}/manual-pay`, { paymentMethod, referenceNote });
    return response.data;
  },

  createInvoice: async (data: any) => {
    const response = await apiClient.post('/billing', data);
    return response.data;
  },

  updateInvoiceStatus: async (id: string, status: string, referenceId?: string, paymentGateway?: string) => {
    const response = await apiClient.patch(`/billing/${id}/status`, { status, referenceId, paymentGateway });
    return response.data;
  }
};
