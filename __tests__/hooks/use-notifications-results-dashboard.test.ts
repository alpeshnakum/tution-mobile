import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useNotifications } from '@/hooks/use-notifications';
import { useResults } from '@/hooks/use-results';
import { useDashboard } from '@/hooks/use-dashboard';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    put: jest.fn(),
  },
  getErrorMessage: (e: any) => e?.message || 'error',
}));

import { api } from '@/lib/api';

beforeEach(() => jest.clearAllMocks());

describe('useNotifications', () => {
  const mockNotifs = {
    notifications: [
      { _id: 'n1', title: 'Test', message: 'Hello', type: 'announcement', status: 'pending', createdAt: '2026-05-01T00:00:00Z' },
    ],
    unreadCount: 1,
  };

  it('fetches notifications on mount', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockNotifs } });
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.notifications).toHaveLength(1);
    expect(result.current.data.unreadCount).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Server error'));
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Server error');
  });

  it('markAsRead updates notification status optimistically', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockNotifs } });
    (api.put as jest.Mock).mockResolvedValue({});
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAsRead('n1');
    });

    expect(api.put).toHaveBeenCalledWith(expect.stringContaining('n1'));
    expect(result.current.data.unreadCount).toBe(0);
    expect(result.current.data.notifications[0].status).toBe('read');
  });

  it('markAllRead marks all notifications read', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockNotifs } });
    (api.put as jest.Mock).mockResolvedValue({});
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAllRead();
    });

    expect(result.current.data.unreadCount).toBe(0);
    expect(result.current.data.notifications.every(n => n.status === 'read')).toBe(true);
  });

  it('markAllRead throws on API failure', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockNotifs } });
    (api.put as jest.Mock).mockRejectedValue(new Error('Failed'));
    const { result } = renderHook(() => useNotifications());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(result.current.markAllRead()).rejects.toThrow('Failed');
  });
});

describe('useResults', () => {
  const mockResults = [
    { examId: 'e1', examTitle: 'Mid Term', subject: 'Math', examDate: '2026-03-01', examType: 'midterm', marksObtained: 85, totalMarks: 100, percentage: 85, grade: 'A', isPassed: true },
  ];

  it('fetches results on mount', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: { results: mockResults } } });
    const { result } = renderHook(() => useResults('student1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].grade).toBe('A');
    expect(result.current.error).toBeNull();
  });

  it('returns empty array when results key missing', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: {} } });
    const { result } = renderHook(() => useResults('student1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  it('does not fetch when studentId is null', async () => {
    const { result } = renderHook(() => useResults(null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.get).not.toHaveBeenCalled();
  });

  it('sets error on failure', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
    const { result } = renderHook(() => useResults('student1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Unauthorized');
  });
});

describe('useDashboard', () => {
  const mockDashboard = {
    student: { id: 's1', name: 'Ravi', admissionNumber: 'ADM001', classId: 'c1', className: 'Class 10', rollNumber: '5' },
    session: { id: 'sess1', name: '2025-26', displayName: '2025-26' },
    attendance: { month: 'May', percentage: 90, present: 18, absent: 2, late: 0, excused: 0, totalDays: 20 },
    fees: { totalExpected: 12000, totalConcession: 0, totalPaid: 9000, totalDue: 3000 },
    recentResults: [],
    upcomingExams: [],
  };

  it('fetches dashboard on mount', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockDashboard } });
    const { result } = renderHook(() => useDashboard('student1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data?.student.name).toBe('Ravi');
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when studentId is null', async () => {
    const { result } = renderHook(() => useDashboard(null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.get).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it('sets error on failure', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Not found'));
    const { result } = renderHook(() => useDashboard('student1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Not found');
    expect(result.current.data).toBeNull();
  });

  it('refetch re-calls the API', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockDashboard } });
    const { result } = renderHook(() => useDashboard('student1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.refetch(); });
    expect(api.get).toHaveBeenCalledTimes(2);
  });
});
