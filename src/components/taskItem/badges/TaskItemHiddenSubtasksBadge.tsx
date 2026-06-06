import { pluralize } from '$utils/misc';

export const TaskItemHiddenSubtasksBadge = ({ count }: { count: number }) => (
  <span className="inline-flex items-center gap-1 rounded-sm border border-surface-300 bg-surface-100 px-2 py-0.5 font-medium text-surface-600 text-xs dark:border-surface-600 dark:bg-surface-700 dark:text-surface-400">
    {count} hidden {pluralize(count, 'subtask')}
  </span>
);
