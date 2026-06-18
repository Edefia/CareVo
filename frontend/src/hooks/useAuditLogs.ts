import { useQuery } from '@tanstack/react-query';
import { auditService } from '../api/services/audit';

export function useAuditLogs(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditService.getAuditLogs(params),
  });
}
