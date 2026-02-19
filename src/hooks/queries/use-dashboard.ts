import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => dashboardApi.getMetrics(),
  });
}

export function useVisibility(days: number = 30) {
  return useQuery({
    queryKey: ['dashboard', 'visibility', days],
    queryFn: () => dashboardApi.getVisibility(days),
    placeholderData: keepPreviousData,
  });
}

export function useRecentMentions(limit: number = 10) {
  return useQuery({
    queryKey: ['dashboard', 'mentions', limit],
    queryFn: () => dashboardApi.getRecentMentions(limit),
  });
}

export function useTopKeywords(limit: number = 5) {
  return useQuery({
    queryKey: ['dashboard', 'topKeywords', limit],
    queryFn: () => dashboardApi.getTopKeywords(limit),
  });
}

export function useCompetitorComparison() {
  return useQuery({
    queryKey: ['dashboard', 'competitors'],
    queryFn: () => dashboardApi.getCompetitorComparison(),
  });
}
