import { create } from 'zustand';
import Cookies from 'js-cookie';
import type { MeResponse } from '@/lib/api/auth';
import { authApi } from '@/lib/api/auth';

interface AuthState {
  user: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
  setUser: (user: MeResponse) => void;
}

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:3000';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  fetchUser: async () => {
    try {
      const user = await authApi.me();
      set({ user, isLoading: false, isAuthenticated: true });
    } catch {
      set({ user: null, isLoading: false, isAuthenticated: false });
    }
  },

  logout: () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    set({ user: null, isLoading: false, isAuthenticated: false });
    window.location.href = `${AUTH_URL}/login`;
  },

  setUser: (user) => {
    set({ user, isAuthenticated: true });
  },
}));
