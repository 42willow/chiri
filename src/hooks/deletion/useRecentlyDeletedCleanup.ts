import { useEffect } from 'react';
import { RECENTLY_DELETED_CLEANUP_INTERVAL_MS } from '$constants';
import { deleteExpiredRecentlyDeletedTasks } from '$lib/store/tasks';

export const useRecentlyDeletedCleanup = () => {
  useEffect(() => {
    deleteExpiredRecentlyDeletedTasks();
    const intervalId = window.setInterval(
      deleteExpiredRecentlyDeletedTasks,
      RECENTLY_DELETED_CLEANUP_INTERVAL_MS,
    );

    return () => window.clearInterval(intervalId);
  }, []);
};
