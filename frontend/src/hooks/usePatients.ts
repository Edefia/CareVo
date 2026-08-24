import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsService } from '../api/services/patients';

export const usePatients = (params?: any) => {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientsService.getPatients(params),
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientsService.getPatientById(id),
    enabled: !!id,
  });
};

export const usePatientResults = (id: string) => {
  return useQuery({
    queryKey: ['patient', id, 'results'],
    queryFn: () => patientsService.getPatientResults(id),
    enabled: !!id,
  });
};

export const usePatientNotes = (id: string) => {
  return useQuery({
    queryKey: ['patient', id, 'notes'],
    queryFn: () => patientsService.getPatientNotes(id),
    enabled: !!id,
  });
};

export const useCreatePatientNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: any }) => patientsService.createPatientNote(id, note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id, 'notes'] });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => patientsService.updatePatient(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};
