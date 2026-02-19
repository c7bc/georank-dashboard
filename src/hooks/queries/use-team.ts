import { useQuery } from '@tanstack/react-query';
import { teamApi } from '@/lib/api';

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team'],
    queryFn: () => teamApi.listMembers(),
  });
}
