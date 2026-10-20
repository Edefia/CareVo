import { apiClient } from '../client';

export interface ExportParameter {
  parameterKey: string;
  parameterName: string;
  pillar: 'CARDIO' | 'RENAL' | 'METABOLIC';
  value: string;
  unit: string;
  referenceMin: number | null;
  referenceMax: number | null;
  testDate: string;
  laboratoryId: string;
  laboratoryName: string;
}

export interface HealthAccountEntry {
  _id: string;
  clientId: string;
  sourceResultId: string;
  parameterName: string;
  parameterKey: string;
  pillar: 'CARDIO' | 'RENAL' | 'METABOLIC';
  value: string;
  unit: string;
  referenceMin: number | null;
  referenceMax: number | null;
  testDate: string;
  laboratoryId: string;
  laboratoryName: string;
  exportedAt: string;
  createdAt: string;
}

export interface ExportHistoryEvent {
  resultId: string;
  resultName: string;
  testDate: string;
  parametersExported: string[];
  exportedAt: string;
  laboratoryName: string;
}

export interface HealthAccountStats {
  totalEntries: number;
  uniqueClients: number;
  uniqueParameters: number;
}

export const healthAccountService = {
  getMyHealthAccount: async (): Promise<Record<string, HealthAccountEntry[]>> => {
    const response = await apiClient.get('/health-account/me');
    return response.data?.data ?? response.data;
  },

  exportParameters: async (resultId: string, parameters: ExportParameter[]) => {
    const response = await apiClient.post('/health-account/export', {
      resultId,
      parameters,
    });
    return response.data?.data ?? response.data;
  },

  removeParameter: async (parameterKey: string) => {
    const response = await apiClient.delete(`/health-account/parameter/${parameterKey}`);
    return response.data?.data ?? response.data;
  },

  getExportHistory: async (): Promise<ExportHistoryEvent[]> => {
    const response = await apiClient.get('/health-account/export-history');
    return response.data?.data ?? response.data;
  },

  getHealthAccountStats: async (): Promise<HealthAccountStats> => {
    const response = await apiClient.get('/health-account/stats');
    return response.data?.data ?? response.data;
  },
};
