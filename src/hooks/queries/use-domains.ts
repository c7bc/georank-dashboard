import { useQuery } from '@tanstack/react-query';
import { domainsApi } from '@/lib/api';
import type { PaginationParams } from '@/types';

export function useDomains(params?: PaginationParams) {
  return useQuery({
    queryKey: ['domains', params],
    queryFn: () => domainsApi.list(params),
  });
}
