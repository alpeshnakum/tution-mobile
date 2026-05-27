import { useState } from 'react';
import { api, getErrorMessage } from '@/lib/api';

interface ProfileUpdatePayload {
  phone?: string;
  email?: string;
  address?: string;
}

export function useProfileUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (payload: ProfileUpdatePayload): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.put('/api/portal/student/profile', payload);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, reset: () => setError(null) };
}
