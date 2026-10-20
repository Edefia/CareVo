import { apiClient } from '../client';

export interface FollowUp {
  _id: string;
  clientId: string;
  resultId: {
    _id: string;
    panelName: string;
    collectionDate: string;
    referralCode: string;
  } | string;
  interpretationId: string;
  interpreterId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
  type: 'FURTHER_TESTING' | 'MEDICATION_REFERRAL' | 'CLINICIAN_APPOINTMENT' | 'FACILITY_TRANSFER';
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  facility: string | null;
  notes: string;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';
  acknowledgedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFollowUpData {
  clientId: string;
  resultId: string;
  interpretationId: string;
  type: FollowUp['type'];
  urgency: FollowUp['urgency'];
  facility?: string | null;
  notes: string;
}

export interface PendingCountResponse {
  pendingCount: number;
  hasUrgent: boolean;
  hasEmergency?: boolean;
}

export interface FollowUpOverviewStats {
  total: number;
  pending: number;
  urgent: number;
  emergency: number;
  inProgress: number;
  completed: number;
}

export const followUpService = {
  createFollowUp: async (data: CreateFollowUpData) => {
    const response = await apiClient.post('/follow-ups', data);
    return response.data?.data ?? response.data;
  },

  getMyFollowUps: async (): Promise<FollowUp[]> => {
    const response = await apiClient.get('/follow-ups/me');
    return response.data?.data ?? response.data;
  },

  getAllFollowUps: async (params?: { status?: string }): Promise<FollowUp[]> => {
    const response = await apiClient.get('/follow-ups', { params });
    return response.data?.data ?? response.data;
  },

  getOverviewStats: async (): Promise<FollowUpOverviewStats> => {
    const response = await apiClient.get('/follow-ups/overview-stats');
    return response.data?.data ?? response.data;
  },

  acknowledgeFollowUp: async (id: string) => {
    const response = await apiClient.patch(`/follow-ups/${id}/acknowledge`);
    return response.data?.data ?? response.data;
  },

  updateFollowUpStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/follow-ups/${id}/status`, { status });
    return response.data?.data ?? response.data;
  },

  getPendingCount: async (): Promise<PendingCountResponse> => {
    const response = await apiClient.get('/follow-ups/pending-count');
    return response.data?.data ?? response.data;
  },
};
