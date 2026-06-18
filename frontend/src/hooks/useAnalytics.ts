import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../api/services/analytics';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['analytics', 'dashboard-metrics'],
    queryFn: analyticsService.getDashboardMetrics,
  });
}

export function useRevenueChart() {
  return useQuery({
    queryKey: ['analytics', 'revenue-chart'],
    queryFn: analyticsService.getRevenueChart,
  });
}

export function useBookingStats() {
  return useQuery({
    queryKey: ['analytics', 'booking-stats'],
    queryFn: analyticsService.getBookingStats,
  });
}
