import { useState, useEffect, useCallback } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import type { Announcement } from '@/lib/types';

export function useAnnouncements() {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/portal/announcements');
      setData(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
