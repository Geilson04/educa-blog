import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'DOCENTE' | 'ALUNO';
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

/**
 * Zustand store for authentication state. Stores the current user and
 * JWT token. Persists state to localStorage so that refreshes
 * maintain the session.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (token, user) => {
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ token, user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ token: null, user: null });
  },
}));

// Initialize store from localStorage on mount (client side). We can't
// directly read localStorage when the store is created on the server,
// so this helper should be called from a client component.
export function hydrateAuthFromStorage() {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  if (token && userRaw) {
    try {
      const user: User = JSON.parse(userRaw);
      useAuthStore.getState().setAuth(token, user);
    } catch (e) {
      // If parse fails, clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
}