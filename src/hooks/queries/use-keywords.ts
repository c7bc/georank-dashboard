import { useQuery } from '@tanstack/react-query';
import { keywordsApi } from '@/lib/api';
import type { PaginationParams } from '@/types';

export function useKeywords(params?: PaginationParams & { status?: string; category?: string; search?: string; platform?: string; sort?: string; domain_id?: string }) {
  return useQuery({
    queryKey: ['keywords', params],
    queryFn: () => keywordsApi.list(params),
  });
}
