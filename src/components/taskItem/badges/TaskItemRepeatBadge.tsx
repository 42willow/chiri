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
      className="inline-flex max-w-36 items-center gap-1 rounded-sm border border-surface-300 bg-surface-50 px-2 py-0.5 font-medium text-surface-600 text-xs dark:border-surface-600 dark:bg-surface-800 dark:text-surface-400"
    >
      <RefreshCw className="h-3 w-3 shrink-0" />
      <span className="truncate">{short}</span>
    </span>
  );
};
