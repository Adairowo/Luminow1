import { create } from 'zustand';
import api from '@/lib/axios';

export interface Tenant {
  id: number;
  business_name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  booking_url?: string;
  qr_code_url?: string | null;
  subscription_status?: string;
  trial_ends_at?: string | null;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'owner' | 'staff';
  role_label?: string;
  staff_member_id?: number | null;
}

interface AuthState {
  user: AuthUser | null;
  tenant: Tenant | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser | null, tenant?: Tenant | null) => void;
  setToken: (token: string) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tenant: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user, tenant = null) =>
    set({ user, tenant, isAuthenticated: !!user }),

  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    set({ token });
  },

  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch {
      // Silently fail — token may already be invalid
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      set({ user: null, tenant: null, token: null, isAuthenticated: false });
    }
  },
}));
