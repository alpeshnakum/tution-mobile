import { useAuthStore } from '@/lib/auth-store';

jest.mock('@/lib/api', () => ({
  api: {
    post: jest.fn(),
  },
  getErrorMessage: (e: any) => e?.message || 'error',
}));

jest.mock('@/lib/secure-storage', () => ({
  secureStorage: {
    saveToken: jest.fn(),
    saveRefreshToken: jest.fn(),
    saveUser: jest.fn(),
    saveStudentId: jest.fn(),
    getToken: jest.fn(),
    getUser: jest.fn(),
    getStudentId: jest.fn(),
    getStudentMeta: jest.fn().mockResolvedValue({ classId: null, sectionId: null, sessionId: null }),
    clearAll: jest.fn(),
  },
}));

import { api } from '@/lib/api';
import { secureStorage } from '@/lib/secure-storage';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      studentId: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      studentClassId: null,
      studentSectionId: null,
      studentSessionId: null,
    });
    jest.clearAllMocks();
  });

  it('login sets auth state on success', async () => {
    const mockUser = { id: 'u1', role: 'student', username: 'test', email: 't@t.com', firstName: 'T', lastName: 'T', branchId: 'b1', isActive: true };
    (api.post as jest.Mock).mockResolvedValue({ data: { user: mockUser, accessToken: 'tok123' } });

    await useAuthStore.getState().login('test', 'pass');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('tok123');
    expect(state.studentId).toBe('u1');
    expect(secureStorage.saveToken).toHaveBeenCalledWith('tok123');
  });

  it('login sets error on failure', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    await expect(useAuthStore.getState().login('bad', 'bad')).rejects.toThrow();
    expect(useAuthStore.getState().error).toBe('Invalid credentials');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('logout clears all state', async () => {
    (api.post as jest.Mock).mockResolvedValue({});
    useAuthStore.setState({ isAuthenticated: true, user: { id: 'u1' } as any, accessToken: 'tok' });

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(secureStorage.clearAll).toHaveBeenCalled();
  });

  it('loadFromStorage restores session if token exists', async () => {
    const mockUser = { id: 'u1', role: 'student', username: 'test', email: 't@t.com', firstName: 'T', lastName: 'T', branchId: 'b1', isActive: true };
    (secureStorage.getToken as jest.Mock).mockResolvedValue('savedToken');
    (secureStorage.getUser as jest.Mock).mockResolvedValue(mockUser);
    (secureStorage.getStudentId as jest.Mock).mockResolvedValue('u1');

    await useAuthStore.getState().loadFromStorage();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('savedToken');
  });

  it('loadFromStorage sets isLoading false if no token', async () => {
    (secureStorage.getToken as jest.Mock).mockResolvedValue(null);
    (secureStorage.getUser as jest.Mock).mockResolvedValue(null);
    (secureStorage.getStudentId as jest.Mock).mockResolvedValue(null);

    await useAuthStore.getState().loadFromStorage();

    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
