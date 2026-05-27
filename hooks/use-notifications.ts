import { useState, useEffect, useCallback } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import type { NotificationsData } from '@/lib/types';

export function useNotifications() {
  const [data, setData] = useState<NotificationsData>({ notifications: [], unreadCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/portal/notifications');
      setData(res.data.data || { notifications: [], unreadCount: 0 });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.put(`/api/portal/notifications/${id}/read`);
      setData((prev) => ({
        notifications: prev.notifications.map((n) =>
          n._id === id ? { ...n, status: 'read' as const } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch {
      // silent fail — UI already optimistically updated
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.put('/api/portal/notifications/read-all');
      setData((prev) => ({
        notifications: prev.notifications.map((n) => ({ ...n, status: 'read' as const })),
        unreadCount: 0,
      }));
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch, markAsRead, markAllRead };
}
