import { useState, useEffect, useCallback } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import type { TimetableDay } from '@/lib/types';

export function useTimetable(
  classId: string | null,
  branchId: string | null,
  sessionId: string | null,
  sectionId?: string | null,
) {
  const [data, setData] = useState<TimetableDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!classId || !branchId || !sessionId) return;
    setLoading(true);
    setError(null);
    try {
      let url = `/api/timetables/class/${classId}?branchId=${branchId}&sessionId=${sessionId}`;
      if (sectionId) url += `&sectionId=${sectionId}`;
      const res = await api.get(url);
      setData(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [classId, branchId, sessionId, sectionId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
