import { useQuery } from '@tanstack/react-query';
import { competitorsApi } from '@/lib/api';

export function useCompetitors() {
  return useQuery({
    queryKey: ['competitors'],
    queryFn: () => competitorsApi.list(),
  });
}

export function useCompetitorAnalysis(id: number) {
  return useQuery({
    queryKey: ['competitor-analysis', id],
    queryFn: () => competitorsApi.getAnalysis(id),
    enabled: id > 0,
  });
}
