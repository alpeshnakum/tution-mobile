import { useState, useEffect, useCallback } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import type { ReceiptData } from '@/lib/types';

export function useReceipt(receiptNumber: string | null) {
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!receiptNumber) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/portal/student/receipts/${encodeURIComponent(receiptNumber)}`);
      setData(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [receiptNumber]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
