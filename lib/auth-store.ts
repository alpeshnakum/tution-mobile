import { create } from 'zustand';
import { api, getErrorMessage } from './api';
import { secureStorage } from './secure-storage';
import type { User } from './types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  studentId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  setStudentId: (id: string) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  accessToken: null,
  studentId: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (identifier, password) => {
    set({ error: null });
    try {
      const { data } = await api.post('/api/auth/login', { identifier, password });
      const { user, accessToken } = data;

      await secureStorage.saveToken(accessToken);
      await secureStorage.saveUser(user);

      const studentId = user.role === 'student' ? user.id : null;
      if (studentId) await secureStorage.saveStudentId(studentId);

      set({ user, accessToken, studentId, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout').catch(() => {});
    } finally {
      await secureStorage.clearAll();
      set({ user: null, accessToken: null, studentId: null, isAuthenticated: false, isLoading: false });
    }
  },

  loadFromStorage: async () => {
    set({ isLoading: true });
    try {
      const [token, user, studentId] = await Promise.all([
        secureStorage.getToken(),
        secureStorage.getUser(),
        secureStorage.getStudentId(),
      ]);
      if (token && user) {
        set({ user: user as User, accessToken: token, studentId, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false, isAuthenticated: false, user: null, accessToken: null, studentId: null });
    }
  },

  setStudentId: (id) => set({ studentId: id }),
}));
