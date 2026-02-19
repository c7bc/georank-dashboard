import { useAuthStore } from '@/stores/auth-store';
import type { MeResponse } from '@/lib/api/auth';

export function useUser(): MeResponse {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    throw new Error('useUser must be used within an authenticated context');
  }
  return user;
}
