import { useState, useEffect, useCallback } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import type { AttendanceData } from '@/lib/types';

export function useAttendance(studentId: string | null) {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/portal/student/attendance?studentId=${studentId}`);
      setData(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
