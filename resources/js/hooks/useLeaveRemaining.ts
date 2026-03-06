// hooks/useLeaveRemaining.ts
import { useEffect } from 'react';
import api from '@/lib/axios';

export function useLeaveRemaining(setData: (key: string, value: any) => void) {
  useEffect(() => {
    api.get('/sanctum/csrf-cookie').then(() => {
      api
        .get('/api/user/leave-remaining')
        .then((res) => {
          const hours = res.data.remaining_hours ?? 0;
          setData('remainingLeave', Math.floor(hours / 24));
        })
        .catch(() => setData('remainingLeave', 0));
    });
  }, []);
}
