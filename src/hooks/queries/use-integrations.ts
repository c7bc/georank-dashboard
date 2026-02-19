import { useQuery } from '@tanstack/react-query';
import { integrationsApi } from '@/lib/api';

export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => integrationsApi.list(),
  });
}
