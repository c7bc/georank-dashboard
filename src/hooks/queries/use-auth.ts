import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api';

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
  });
}
