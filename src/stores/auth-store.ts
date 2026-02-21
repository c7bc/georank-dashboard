import { create } from 'zustand';
import type { MeResponse } from '@/lib/api/auth';
import { authApi } from '@/lib/api/auth';
import { APIClientError } from '@/lib/api/client';

interface AuthState {
  user: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: MeResponse) => void;
}

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3000';

const doLogout = async (set: (state: Partial<AuthState>) => void) => {
  try {
    await authApi.logout();
  } catch {
    // ignore - backend may already have invalidated the session
  }
  set({ user: null, isLoading: false, isAuthenticated: false });
  window.location.href = `${AUTH_URL}/login`;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  fetchUser: async () => {
    try {
      const user = await authApi.me();
      set({ user, isLoading: false, isAuthenticated: true });
    } catch (err) {
      if (err instanceof APIClientError && (err.status === 401 || err.status === 404)) {
        await doLogout(set);
        return;
      }
      set({ user: null, isLoading: false, isAuthenticated: false });
    }
  },

  logout: () => doLogout(set),

  setUser: (user) => {
    set({ user, isAuthenticated: true });
  },
}));
