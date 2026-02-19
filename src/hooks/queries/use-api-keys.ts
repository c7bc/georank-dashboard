import { useQuery } from '@tanstack/react-query';
import { apiKeysApi } from '@/lib/api';

export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiKeysApi.list(),
  });
}
