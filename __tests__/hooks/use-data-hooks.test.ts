import { renderHook, waitFor } from '@testing-library/react-native';
import { useAttendance } from '@/hooks/use-attendance';
import { useFees } from '@/hooks/use-fees';
import { useLeaves } from '@/hooks/use-leaves';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
  getErrorMessage: (e: any) => e?.message || 'error',
}));

import { api } from '@/lib/api';

beforeEach(() => jest.clearAllMocks());

describe('useAttendance', () => {
  it('fetches attendance data on mount', async () => {
    const mockData = {
      student: { id: 's1', name: 'Test', admissionNumber: 'ADM001' },
      month: 5,
      year: 2026,
      summary: { totalDays: 20, present: 18, absent: 2, late: 0, excused: 0, percentage: 90 },
      records: [],
    };
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

    const { result } = renderHook(() => useAttendance('student1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(api.get).toHaveBeenCalledWith(expect.stringContaining('student1'));
  });

  it('sets error on fetch failure', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAttendance('student1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toBeNull();
  });

  it('does not fetch when studentId is null', async () => {
    const { result } = renderHook(() => useAttendance(null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.get).not.toHaveBeenCalled();
  });
});

describe('useFees', () => {
  it('fetches fees on mount', async () => {
    const mockFees = {
      student: { id: 's1', name: 'Test', admissionNumber: 'ADM001' },
      session: { id: 'sess1', name: '2025-26', displayName: '2025-26', installmentType: 'quarterly', installmentCount: 4 },
      advanceBalance: 0,
      installments: [],
      totals: { totalExpected: 12000, totalConcession: 0, totalPaid: 9000, totalDue: 3000 },
      paymentHistory: [],
    };
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockFees } });

    const { result } = renderHook(() => useFees('student1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockFees);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when studentId is null', async () => {
    const { result } = renderHook(() => useFees(null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.get).not.toHaveBeenCalled();
  });
});

describe('useLeaves', () => {
  it('fetches leaves on mount', async () => {
    const mockLeaves = [
      { _id: 'l1', leaveType: 'sick', fromDate: '2026-05-01', toDate: '2026-05-02', totalDays: 2, reason: 'Fever', status: 'pending' },
    ];
    (api.get as jest.Mock).mockResolvedValue({ data: { data: mockLeaves } });

    const { result } = renderHook(() => useLeaves('student1'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(mockLeaves);
  });

  it('submitLeave calls POST and refetches', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { data: [] } });
    (api.post as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useLeaves('student1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await result.current.submitLeave({
      leaveType: 'sick',
      fromDate: '2026-05-10',
      toDate: '2026-05-11',
      reason: 'Unwell',
    });

    expect(api.post).toHaveBeenCalledWith(
      expect.stringContaining('leaves'),
      expect.objectContaining({ leaveType: 'sick' })
    );
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it('does not fetch when studentId is null', async () => {
    const { result } = renderHook(() => useLeaves(null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.get).not.toHaveBeenCalled();
  });
});
