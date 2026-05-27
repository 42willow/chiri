import ChevronDown from 'lucide-react/icons/chevron-down';
import Plus from 'lucide-react/icons/plus';
import { SidebarFilterItem } from '$components/sidebar/SidebarFilterItem';
import { Tooltip } from '$components/Tooltip';
import { matchesFilter } from '$lib/store/filters';
import type { Filter, Task } from '$types';

interface SidebarFiltersListProps {
  filters: Filter[];
  tasks: Task[];
  activeFilterId: string | null;
  isAnyModalOpen: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onSelectFilter: (filterId: string) => void;
  onAddFilter: () => void;
  onContextMenu: (e: React.MouseEvent, type: 'filter', id: string) => void;
}

const isActiveTask = (task: Task) =>
  !task.deletedAt && task.status !== 'completed' && task.status !== 'cancelled';

export const SidebarFiltersList = ({
  filters,
  tasks,
  activeFilterId,
  isAnyModalOpen,
  collapsed,
  onToggle,
  onSelectFilter,
  onAddFilter,
  onContextMenu,
}: SidebarFiltersListProps) => {
  const getFilterTaskCount = (filter: Filter) =>
    tasks.filter((task) => isActiveTask(task) && matchesFilter(task, filter)).length;

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          className="flex h-9 min-w-0 flex-1 items-center gap-1.5 px-2.5 rounded-lg text-left cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
        >
          <ChevronDown
            className={`w-4 h-4 text-surface-400 motion-safe:transition-transform motion-safe:duration-200 ${collapsed ? '-rotate-90' : 'rotate-0'}`}
          />
          <span className="text-sm font-semibold text-surface-500 dark:text-surface-400">
            Filters
          </span>
        </button>

        <Tooltip content="Add filter" position="top" triggerClassName="shrink-0">
          <button
            type="button"
            onClick={() => {
              onAddFilter();
            }}
            className={`flex h-9 w-8 shrink-0 items-center justify-center rounded-lg ${!isAnyModalOpen ? 'hover:bg-surface-300 dark:hover:bg-surface-600 hover:text-surface-700 dark:hover:text-surface-300' : ''} text-surface-500 dark:text-surface-400 transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div
        className={`grid motion-safe:transition-[grid-template-rows] motion-safe:duration-200 motion-safe:ease-in-out ${collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'} pt-1`}
      >
        <div className="overflow-hidden space-y-1">
          {filters.length === 0 ? (
            <div className="px-3 py-1 text-sm text-surface-500 dark:text-surface-400">
              No filters. Click + to add one.
            </div>
          ) : (
            filters.map((filter) => (
              <SidebarFilterItem
                key={filter.id}
                filter={filter}
                isActive={activeFilterId === filter.id}
                isAnyModalOpen={isAnyModalOpen}
                taskCount={getFilterTaskCount(filter)}
                onSelect={() => onSelectFilter(filter.id)}
                onContextMenu={(e) => onContextMenu(e, 'filter', filter.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
