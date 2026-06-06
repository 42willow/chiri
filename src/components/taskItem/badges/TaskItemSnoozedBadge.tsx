import BellOff from 'lucide-react/icons/bell-off';
import X from 'lucide-react/icons/x';
import { useTaskSnooze } from '$lib/notifications/snoozes';
import { formatTime } from '$utils/date';

export const TaskItemSnoozedBadge = ({ taskId }: { taskId: string }) => {
  const { until, clear } = useTaskSnooze(taskId);

  if (!until || until <= Date.now()) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded border border-semantic-warning bg-semantic-warning/15 px-2 py-0.5 font-medium text-semantic-warning text-xs">
      <BellOff className="h-3 w-3" />
      Snoozed until {formatTime(new Date(until))}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          clear();
        }}
        className="ml-0.5 rounded outline-hidden hover:bg-semantic-warning/20 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
        aria-label="Cancel snooze"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
};
