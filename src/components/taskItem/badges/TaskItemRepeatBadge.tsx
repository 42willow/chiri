import RefreshCw from 'lucide-react/icons/refresh-cw';
import type { DateFormat } from '$types/preference';
import { rruleToDisplaySummary, rruleToText } from '$utils/recurrence';

export const TaskItemRepeatBadge = ({
  rrule,
  repeatFrom,
  dateFormat,
}: {
  rrule: string;
  repeatFrom?: number;
  dateFormat?: DateFormat;
}) => {
  const fullSummary = rruleToText(rrule, repeatFrom, dateFormat);
  const { short } = rruleToDisplaySummary(rrule, repeatFrom, dateFormat);

  return (
    <span
      title={`Repeats: ${fullSummary}`}
      className="inline-flex max-w-36 items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400"
    >
      <RefreshCw className="w-3 h-3 shrink-0" />
      <span className="truncate">{short}</span>
    </span>
  );
};
