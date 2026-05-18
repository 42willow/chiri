import { createContext } from 'react';

interface SyncProgress {
  current: number;
  total: number;
}

interface SyncState {
  syncingCalendarId: string | null;
  syncProgress: SyncProgress | null;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  lastSyncError: string | null;
}

interface SyncActions {
  setSyncingCalendarId: (id: string | null) => void;
  setSyncProgress: (progress: SyncProgress | null) => void;
  setIsSyncing: (syncing: boolean) => void;
  setLastSyncTime: (time: Date | null) => void;
  setLastSyncError: (error: string | null) => void;
  registerInitialSyncCallback: (callback: () => void) => void;
}

export type SyncStore = SyncState & SyncActions;

// Context for React components
export const SyncContext = createContext<SyncStore | null>(null);
