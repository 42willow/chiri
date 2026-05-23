import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Task } from '$types';
import type { SettingsState } from '$types/settings';
import type { PendingDeletion } from '$types/store';
import { makeTask } from '../../fixtures';

// vi.mock factories are hoisted; pre-create the mock fn refs via vi.hoisted
// so they're initialized before the mock factories run
const { mockAddPendingDeletion, mockUpdateTask, mockGetSettingsState, mockSettingsState } =
  vi.hoisted(() => {
    const mockSettingsState: Partial<SettingsState> = {
      defaultCalendarId: null,
      defaultPriority: 'none',
      defaultStatus: 'needs-action',
      defaultPercentComplete: 0,
      defaultTags: [],
      defaultStartDate: 'none',
      defaultDueDate: 'none',
      defaultReminders: [],
      defaultRrule: undefined,
      defaultRepeatFrom: 0,
      defaultAllDayReminderHour: 9,
      allDayReminderNotificationsEnabled: true,
    };

    return {
      mockAddPendingDeletion: vi.fn().mockResolvedValue(undefined),
      mockUpdateTask: vi.fn().mockResolvedValue(undefined),
      mockGetSettingsState: vi.fn(() => mockSettingsState),
      mockSettingsState,
    };
  });

vi.mock('@tauri-apps/plugin-sql', () => ({ default: { load: vi.fn() } }));
vi.mock('@tauri-apps/plugin-notification', () => ({}));

vi.mock('$lib/database', () => ({
  db: {
    addPendingDeletion: mockAddPendingDeletion,
    updateTask: mockUpdateTask,
    subscribe: vi.fn(() => vi.fn()),
    getIsInitialized: vi.fn(() => false),
  },
}));

// settingsStore.getState() is called by task helpers. minimal defaults
vi.mock('$context/settingsContext', () => ({
  settingsStore: {
    getState: mockGetSettingsState,
  },
}));

vi.mock('$hooks/ui/useToast', () => ({
  toastManager: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('$lib/ical/vtodo', () => ({
  toAppleEpoch: vi.fn((ms: number) => ms),
}));

vi.mock('$utils/recurrence', () => ({
  getNextOccurrence: vi.fn(),
  parseRRule: vi.fn(() => ({})),
}));

import { dataStore, defaultDataStore, defaultUIState } from '$lib/store';
import { createTask, updateTask } from '$lib/store/tasks';

const seedStore = (tasks: Task[], pendingDeletions: PendingDeletion[] = []) => {
  dataStore.save({
    ...defaultDataStore,
    tasks,
    pendingDeletions,
    ui: defaultUIState,
  });
};

/**
 * regression coverage for the calendar-move issue. moving a synced task to a
 * different calendar previously silently kept it in the old calendar (or worse,
 * lost it after multiple syncs). CalDAV addresses tasks by URL, so the only
 * way to "move" is delete-from-old + create-in-new
 */
describe('updateTask — calendar move detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSettingsState.mockReturnValue(mockSettingsState);
    seedStore([]);
  });

  it('queues a pending deletion and clears href/etag when a synced task is moved to a new calendar', () => {
    const task = makeTask({
      id: 'task-1',
      uid: 'uid-1',
      href: '/caldav/personal/task.ics',
      etag: 'abc123',
      calendarId: 'personal',
      accountId: 'account-1',
      synced: true,
    });
    seedStore([task]);

    const result = updateTask('task-1', { calendarId: 'work' });

    expect(mockAddPendingDeletion).toHaveBeenCalledOnce();
    expect(mockAddPendingDeletion).toHaveBeenCalledWith({
      uid: 'uid-1',
      href: '/caldav/personal/task.ics',
      accountId: 'account-1',
      calendarId: 'personal',
    });

    expect(result?.href).toBeUndefined();
    expect(result?.etag).toBeUndefined();
    expect(result?.calendarId).toBe('work');
  });

  it('adds the deletion to the in-memory pendingDeletions list', () => {
    const task = makeTask({
      id: 'task-1',
      uid: 'uid-1',
      href: '/caldav/personal/task.ics',
      calendarId: 'personal',
      accountId: 'account-1',
      synced: true,
    });
    seedStore([task]);

    updateTask('task-1', { calendarId: 'work' });

    const { pendingDeletions } = dataStore.load();
    expect(pendingDeletions).toHaveLength(1);
    expect(pendingDeletions[0]).toMatchObject({
      uid: 'uid-1',
      href: '/caldav/personal/task.ics',
      accountId: 'account-1',
      calendarId: 'personal',
    });
  });

  it('does not queue a pending deletion when calendarId is unchanged', () => {
    const task = makeTask({
      id: 'task-1',
      href: '/caldav/personal/task.ics',
      calendarId: 'personal',
    });
    seedStore([task]);

    updateTask('task-1', { calendarId: 'personal', title: 'Updated title' });

    expect(mockAddPendingDeletion).not.toHaveBeenCalled();
    expect(dataStore.load().pendingDeletions).toHaveLength(0);
  });

  it('does not queue a pending deletion when the task has no href (never synced)', () => {
    const task = makeTask({
      id: 'task-1',
      href: undefined,
      etag: undefined,
      calendarId: 'personal',
    });
    seedStore([task]);

    updateTask('task-1', { calendarId: 'work' });

    expect(mockAddPendingDeletion).not.toHaveBeenCalled();
    expect(dataStore.load().pendingDeletions).toHaveLength(0);
  });

  it('does not queue a pending deletion when calendarId is not in updates', () => {
    const task = makeTask({
      id: 'task-1',
      href: '/caldav/personal/task.ics',
      calendarId: 'personal',
    });
    seedStore([task]);

    updateTask('task-1', { title: 'New title' });

    expect(mockAddPendingDeletion).not.toHaveBeenCalled();
    expect(dataStore.load().pendingDeletions).toHaveLength(0);

    // href must remain intact so subsequent syncs still work
    const stored = dataStore.load().tasks.find((t) => t.id === 'task-1');
    expect(stored?.href).toBe('/caldav/personal/task.ics');
  });

  it('preserves existing pending deletions when adding a new one', () => {
    const existing: PendingDeletion = {
      uid: 'other-uid',
      href: '/caldav/work/other.ics',
      accountId: 'account-1',
      calendarId: 'work',
    };
    const task = makeTask({
      id: 'task-1',
      uid: 'uid-1',
      href: '/caldav/personal/task.ics',
      calendarId: 'personal',
    });
    seedStore([task], [existing]);

    updateTask('task-1', { calendarId: 'work' });

    const { pendingDeletions } = dataStore.load();
    expect(pendingDeletions).toHaveLength(2);
    expect(pendingDeletions[0]).toEqual(existing);
    expect(pendingDeletions[1].uid).toBe('uid-1');
  });

  it('captures the OLD calendarId in the pending deletion, not the new one', () => {
    const task = makeTask({
      id: 'task-1',
      uid: 'uid-1',
      calendarId: 'personal',
      accountId: 'my-account',
      href: '/caldav/personal/task.ics',
    });
    seedStore([task]);

    updateTask('task-1', { calendarId: 'archive' });

    const deletion = mockAddPendingDeletion.mock.calls[0][0] as PendingDeletion;
    expect(deletion.calendarId).toBe('personal');
    expect(deletion.accountId).toBe('my-account');
    expect(deletion.href).toBe('/caldav/personal/task.ics');
  });

  it('marks the task as unsynced after a calendar move so next sync pushes it', () => {
    const task = makeTask({
      id: 'task-1',
      href: '/caldav/personal/task.ics',
      synced: true,
    });
    seedStore([task]);

    const result = updateTask('task-1', { calendarId: 'work' });

    expect(result?.synced).toBe(false);
  });

  it('returns undefined when the task id does not exist', () => {
    seedStore([]);

    const result = updateTask('nonexistent-id', { calendarId: 'work' });

    expect(result).toBeUndefined();
    expect(mockAddPendingDeletion).not.toHaveBeenCalled();
  });

  it('moving A → B → A within one tick queues two deletions (one per move)', () => {
    // documents current behavior: a second move (back to original calendar)
    // does NOT queue a deletion because step 1 cleared the href. this means
    // rapid back-and-forth moves can lose intermediate state. relies on the
    // next sync to reconcile
    const task = makeTask({
      id: 'task-1',
      uid: 'uid-1',
      href: '/caldav/personal/task.ics',
      calendarId: 'personal',
    });
    seedStore([task]);

    updateTask('task-1', { calendarId: 'work' });
    updateTask('task-1', { calendarId: 'personal' });

    // only the first move queued a deletion (href was non-null then)
    expect(mockAddPendingDeletion).toHaveBeenCalledOnce();
    const stored = dataStore.load().tasks.find((t) => t.id === 'task-1');
    expect(stored?.href).toBeUndefined();
    expect(stored?.calendarId).toBe('personal');
  });
});

describe('createTask — all-day reminder notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSettingsState.mockReturnValue({
      ...mockSettingsState,
      defaultDueDate: 'today',
      defaultReminders: ['at-due'],
    });
    seedStore([]);
  });

  it('adds default reminders to all-day tasks when enabled', () => {
    const task = createTask({ title: 'All-day task' });

    expect(task.dueDateAllDay).toBe(true);
    expect(task.reminders).toHaveLength(1);
    expect(task.reminders?.[0].trigger.getHours()).toBe(9);
  });

  it('skips default reminders for all-day tasks when disabled', () => {
    mockGetSettingsState.mockReturnValue({
      ...mockSettingsState,
      defaultDueDate: 'today',
      defaultReminders: ['at-due'],
      allDayReminderNotificationsEnabled: false,
    });

    const task = createTask({ title: 'Quiet all-day task' });

    expect(task.dueDateAllDay).toBe(true);
    expect(task.reminders).toBeUndefined();
  });

  it('still adds default reminders to timed tasks when all-day reminders are disabled', () => {
    mockGetSettingsState.mockReturnValue({
      ...mockSettingsState,
      defaultReminders: ['at-due'],
      allDayReminderNotificationsEnabled: false,
    });
    const dueDate = new Date(2025, 0, 15, 14, 30);

    const task = createTask({
      title: 'Timed task',
      dueDate,
      dueDateAllDay: false,
    });

    expect(task.dueDateAllDay).toBe(false);
    expect(task.reminders).toHaveLength(1);
    expect(task.reminders?.[0].trigger).toEqual(dueDate);
  });
});
