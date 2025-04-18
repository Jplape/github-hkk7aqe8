import { create } from 'zustand';
import { supabase } from '../lib/supabase';


interface User {
  id: string;
  email?: string;
  phone?: string;
  role?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  setUser: (user) => {
    console.log('Setting user:', user);
    set({ user });
  },
  setLoading: (loading) => {
    console.log('Setting loading:', loading);
    set({ loading });
  },
  logout: async () => {
    console.log('Logging out');
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
    set({ user: null, loading: false });
  },
  initialize: async () => {
    console.log('Initializing auth store');
    set({ loading: true });
    
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, loading: false });
    
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      set({ user: session?.user ?? null });
    });
  },
}));

// Réinitialisation au démarrage
if (typeof window !== 'undefined') {
  const store = useAuthStore.getState();
  console.log('Initial auth state:', store);
  store.initialize();
}