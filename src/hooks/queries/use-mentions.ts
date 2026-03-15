import { useQuery } from '@tanstack/react-query';
import { mentionsApi } from '@/lib/api';
import type { PaginationParams } from '@/types';

export function useMentions(params?: PaginationParams & { platform?: string; result?: string; keyword_id?: number }) {
  return useQuery({
    queryKey: ['mentions', params],
    queryFn: () => mentionsApi.list(params),
  });
}
