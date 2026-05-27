import { useState, useEffect, useCallback } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import type { ChildInfo } from '@/lib/types';

export function useChildren() {
  const [data, setData] = useState<ChildInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/portal/parent/children');
      setData(res.data.data?.children || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
