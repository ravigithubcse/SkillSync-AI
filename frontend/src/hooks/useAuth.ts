import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  fetchUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'JOB_SEEKER' | 'RECRUITER';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('token'),
      isAuthenticated: !!localStorage.getItem('token'),
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', data);
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          set({ user: res.data.user, token: res.data.token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) => {
        const current = get().user;
        if (current) {
          const updated = { ...current, ...userData };
          localStorage.setItem('user', JSON.stringify(updated));
          set({ user: updated });
        }
      },

      fetchUser: async () => {
        try {
          const { data } = await api.get('/auth/me');
          localStorage.setItem('user', JSON.stringify(data));
          set({ user: data, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
