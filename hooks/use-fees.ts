import { useState, useEffect, useCallback } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import type { FeesData } from '@/lib/types';

export function useFees(studentId: string | null) {
  const [data, setData] = useState<FeesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/portal/student/fees?studentId=${studentId}`);
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
