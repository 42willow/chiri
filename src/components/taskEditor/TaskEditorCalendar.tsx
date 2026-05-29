import FolderSync from 'lucide-react/icons/folder-sync';
import { getIconByName } from '$constants/icons';
import { useAccentColorResolver, useResolvedAccentColor } from '$hooks/ui/useResolvedAccentColor';
import type { Account, Task } from '$types';

interface TaskEditorCalendarProps {
  task: Task;
  accounts: Account[];
  onOpenMoveCalendar: () => void;
  readOnly?: boolean;
}

export const TaskEditorCalendar = ({
  task,
  accounts,
  onOpenMoveCalendar,
  readOnly = false,
}: TaskEditorCalendarProps) => {
  const resolveAccent = useAccentColorResolver();
  const resolvedAccentColor = useResolvedAccentColor();
  const allCalendars = accounts.flatMap((account) =>
    account.calendars.map((cal) => ({
      ...cal,
      accountId: account.id,
      accountName: account.name,
    })),
  );

  const currentAccount = accounts.find((a) => a.id === task.accountId);
  const currentCalendar = currentAccount?.calendars.find((c) => c.id === task.calendarId);
  const accountLabel = currentAccount?.name ?? (task.accountId ? `Account ${task.accountId}` : '');
  const calendarLabel =
    currentCalendar?.displayName ?? (task.calendarId ? `Calendar ${task.calendarId}` : '');
  const CurrentCalendarIcon = getIconByName(currentCalendar?.icon || 'calendar');
  const currentCalendarColor = currentCalendar?.color
    ? resolveAccent(currentCalendar.color)
    : resolvedAccentColor;

  if (readOnly) {
    return (
      <div>
        <div
          id="task-calendar-label"
          className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-surface-400 mb-2"
        >
          <FolderSync className="w-4 h-4" />
          Calendar
        </div>
        <div className="w-full px-3 py-2 text-sm border border-transparent bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-lg cursor-not-allowed">
          {accountLabel || calendarLabel
            ? [accountLabel, calendarLabel].filter(Boolean).join(' / ')
            : 'No calendar'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor="task-calendar"
        className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-surface-400 mb-2"
      >
        <FolderSync className="w-4 h-4" />
        Calendar
      </label>
      {allCalendars.length > 0 ? (
        <>
          <button
            id="task-calendar"
            type="button"
            onClick={onOpenMoveCalendar}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left bg-surface-100 dark:bg-surface-800 border border-transparent rounded-lg focus:outline-hidden focus:border-primary-500 focus:bg-white dark:focus:bg-surface-800 hover:border-surface-300 dark:hover:border-surface-500 transition-colors"
          >
            {currentCalendar?.emoji ? (
              <span
                className="text-lg leading-none shrink-0"
                style={{ color: currentCalendarColor }}
              >
                {currentCalendar.emoji}
              </span>
            ) : (
              <CurrentCalendarIcon
                className="w-5 h-5 shrink-0"
                style={{ color: currentCalendarColor }}
              />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-surface-700 dark:text-surface-300">
                {calendarLabel || 'Select a calendar...'}
              </span>
              {accountLabel && (
                <span className="block truncate text-xs text-surface-500 dark:text-surface-400">
                  {accountLabel}
                </span>
              )}
            </span>
          </button>
          {task.parentUid && (
            <p className="mt-3 text-xs text-surface-700 dark:text-surface-200 border border-semantic-warning/30 bg-semantic-warning/10 rounded-md p-2">
              Changing the calendar will convert this subtask to a regular task.
            </p>
          )}
        </>
      ) : (
        <div
          className="w-full px-3 py-2 text-sm border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-900 text-surface-400 dark:text-surface-500 rounded-lg cursor-not-allowed"
          title="Add a CalDAV account to assign tasks to calendars"
        >
          No calendars available
        </div>
      )}
    </div>
  );
};
