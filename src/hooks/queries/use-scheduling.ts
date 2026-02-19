import { useQuery } from '@tanstack/react-query';
import { schedulingApi } from '@/lib/api';

export function useScheduling() {
  return useQuery({
    queryKey: ['scheduling'],
    queryFn: () => schedulingApi.get(),
  });
}
