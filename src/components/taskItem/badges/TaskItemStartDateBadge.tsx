import CalendarClock from 'lucide-react/icons/calendar-clock';
import type { formatStartDate } from '$utils/date';

export const TaskItemStartDateBadge = ({
  startDateDisplay,
}: {
  startDateDisplay: ReturnType<typeof formatStartDate>;
}) => (
  <span
    className="inline-flex items-center gap-1 rounded-sm border bg-surface-100 px-2 py-0.5 font-medium text-surface-600 text-xs dark:bg-surface-700 dark:text-surface-400"
    style={{ borderColor: startDateDisplay.borderColor }}
  >
    <CalendarClock className="h-3 w-3" style={{ color: startDateDisplay.borderColor }} />
    {startDateDisplay.text}
  </span>
);
