import RefreshCw from 'lucide-react/icons/refresh-cw';
import { useSettingsStore } from '$context/settingsContext';
import type { Task } from '$types';
import { rruleToDisplaySummary, rruleToText } from '$utils/recurrence';

interface TaskEditorRepeatProps {
  task: Task;
  onOpen: () => void;
  readOnly?: boolean;
}

export const TaskEditorRepeat = ({ task, onOpen, readOnly = false }: TaskEditorRepeatProps) => {
  const { dateFormat } = useSettingsStore();
  const summary = task.rrule
    ? rruleToDisplaySummary(task.rrule, task.repeatFrom, dateFormat)
    : null;
  const fullSummary = task.rrule ? rruleToText(task.rrule, task.repeatFrom, dateFormat) : null;

  return (
    <div>
      <div
        id="repeat-label"
        className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-surface-400 mb-2"
      >
        <RefreshCw className="w-4 h-4" />
        Repeat
      </div>
      <button
        type="button"
        onClick={onOpen}
        disabled={readOnly}
        aria-labelledby="repeat-label"
        title={fullSummary ? `Repeats: ${fullSummary}` : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left bg-surface-100 dark:bg-surface-800 border border-transparent rounded-lg focus:outline-hidden focus:border-primary-500 focus:bg-white dark:focus:bg-surface-800 transition-colors ${
          readOnly ? 'cursor-not-allowed' : 'hover:border-surface-300 dark:hover:border-surface-500'
        }`}
      >
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-200 text-surface-500 dark:bg-surface-700 dark:text-surface-300">
          <RefreshCw className="w-4 h-4" />
        </span>
        {summary ? (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-surface-800 dark:text-surface-100">
              {summary.primary}
            </span>
            {summary.details.length > 0 && (
              <span className="mt-1 flex flex-wrap gap-1.5">
                {summary.details.map((detail) => (
                  <span
                    key={detail}
                    className="rounded-sm bg-surface-200 px-1.5 py-0.5 text-xs font-medium text-surface-500 dark:bg-surface-700 dark:text-surface-300"
                  >
                    {detail}
                  </span>
                ))}
              </span>
            )}
          </span>
        ) : (
          <span className="text-surface-400">{readOnly ? 'No repeat' : 'Set repeat rules...'}</span>
        )}
      </button>
    </div>
  );
};
