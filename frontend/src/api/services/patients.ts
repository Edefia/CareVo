import apiClient from '../client';

export const patientsService = {
  getPatients: async (params?: any) => {
    const { data } = await apiClient.get('/patients', { params });
    return data.data || data; 
  },
  getPatientById: async (id: string) => {
    const { data } = await apiClient.get(`/patients/${id}`);
    return data.data;
  },
  getPatientResults: async (id: string) => {
    const { data } = await apiClient.get(`/patients/${id}/results`);
    return data.data || data;
  },
  getPatientNotes: async (id: string) => {
    const { data } = await apiClient.get(`/patients/${id}/notes`);
    return data.data || data;
  },
  createPatientNote: async (id: string, note: any) => {
    const { data } = await apiClient.post(`/patients/${id}/notes`, note);
    return data.data;
  },
  updatePatient: async (id: string, updates: any) => {
    const { data } = await apiClient.put(`/patients/${id}`, updates);
    return data.data;
  }
};
