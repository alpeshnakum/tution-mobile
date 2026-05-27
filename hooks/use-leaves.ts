import { useState, useEffect, useCallback } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import type { LeaveRequest } from '@/lib/types';

export function useLeaves(studentId: string | null) {
  const [data, setData] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/portal/student/leaves?studentId=${studentId}`);
      setData(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);

  const submitLeave = async (payload: {
    leaveType: string;
    fromDate: string;
    toDate: string;
    reason: string;
  }): Promise<void> => {
    if (!studentId) throw new Error('Not authenticated');
    await api.post('/api/portal/student/leaves', { studentId, ...payload });
    await fetch();
  };

  const cancelLeave = async (leaveId: string): Promise<void> => {
    if (!studentId) throw new Error('Not authenticated');
    await api.delete(`/api/portal/student/leaves/${leaveId}?studentId=${studentId}`);
    await fetch();
  };

  return { data, loading, error, refetch: fetch, submitLeave, cancelLeave };
}
