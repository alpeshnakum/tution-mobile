import { useState, useEffect, useCallback } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import type { HomeworkItem } from '@/lib/types';

export function useHomework(classId: string | null, branchId: string | null, sectionId?: string | null) {
  const [data, setData] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!classId || !branchId) return;
    setLoading(true);
    setError(null);
    try {
      let url = `/api/homework/class/${classId}?branchId=${branchId}`;
      if (sectionId) url += `&sectionId=${sectionId}`;
      const res = await api.get(url);
      setData(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [classId, branchId, sectionId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
