import { create } from 'zustand';

interface UserState {
  token: string | null;
  user: { id: string; email: string; username: string } | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: { id: string; email: string; username: string }) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  token: localStorage.getItem('linglove_token'),
  user: JSON.parse(localStorage.getItem('linglove_user') || 'null'),
  isAuthenticated: !!localStorage.getItem('linglove_token'),

  setAuth: (token, user) => {
    localStorage.setItem('linglove_token', token);
    localStorage.setItem('linglove_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('linglove_token');
    localStorage.removeItem('linglove_user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
