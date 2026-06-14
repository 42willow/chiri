import { useCallback } from 'react';
import type { useSyncQuery } from '$hooks/queries/useSync';

type SyncQuery = ReturnType<typeof useSyncQuery>;

interface UseAppSyncActionsOptions {
  syncAll: SyncQuery['syncAll'];
  syncCalendar: SyncQuery['syncCalendar'];
}

export const useAppSyncActions = ({ syncAll, syncCalendar }: UseAppSyncActionsOptions) => {
  const syncFromHeader = useCallback(() => {
    syncAll({
      source: 'header-sync-button',
      reason: 'user clicked sync in header',
      where: 'App Header.onSync',
    });
  }, [syncAll]);

  const syncFromTray = useCallback(() => {
    syncAll({
      source: 'tray-sync',
      reason: 'user clicked sync from system tray',
      where: 'useTray tray-sync event',
    });
  }, [syncAll]);

  const syncFromKeyboard = useCallback(() => {
    syncAll({
      source: 'keyboard-shortcut',
      reason: 'user pressed keyboard shortcut for sync',
      where: 'useKeyboardShortcuts',
    });
  }, [syncAll]);

  const syncFromMenu = useCallback(() => {
    syncAll({
      source: 'app-menu',
      reason: 'user selected Sync from app menu',
      where: 'useMenuEvents MENU_EVENTS.SYNC',
    });
  }, [syncAll]);

  const syncCalendarFromMenu = useCallback(
    (calendarId: string) => {
      syncCalendar(calendarId, {
        source: 'app-menu',
        reason: 'user selected sync calendar from app menu',
        where: 'useMenuEvents MENU_EVENTS.SYNC_CALENDAR',
      });
    },
    [syncCalendar],
  );

  return {
    syncFromHeader,
    syncFromTray,
    syncFromKeyboard,
    syncFromMenu,
    syncCalendarFromMenu,
  };
};
