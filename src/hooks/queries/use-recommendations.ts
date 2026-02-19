import { useQuery } from '@tanstack/react-query';
import { recommendationsApi } from '@/lib/api';
import type { PaginationParams, RecommendationStatus } from '@/types';

export function useRecommendations(params?: PaginationParams & { status?: RecommendationStatus; priority?: string }) {
  return useQuery({
    queryKey: ['recommendations', params],
    queryFn: () => recommendationsApi.list(params),
  });
}
