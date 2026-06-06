import CheckCircle2 from 'lucide-react/icons/check-circle-2';

export const TaskItemSubtaskProgressBadge = ({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) => (
  <span className="inline-flex items-center gap-1 rounded-sm border border-surface-300 bg-surface-50 px-2 py-0.5 font-medium text-surface-600 text-xs dark:border-surface-600 dark:bg-surface-800 dark:text-surface-400">
    <CheckCircle2 className="h-3 w-3" />
    {completed}/{total}
  </span>
);
