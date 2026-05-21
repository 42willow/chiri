import { getIconByName } from '$constants/icons';
import { useAccentColorResolver, useResolvedAccentColor } from '$hooks/ui/useResolvedAccentColor';
import type { Filter } from '$types';

interface SidebarFilterItemProps {
  filter: Filter;
  isActive: boolean;
  isAnyModalOpen: boolean;
  taskCount: number;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const SidebarFilterItem = ({
  filter,
  isActive,
  isAnyModalOpen,
  taskCount,
  onSelect,
  onContextMenu,
}: SidebarFilterItemProps) => {
  const FilterIcon = getIconByName(filter.icon ?? 'list-todo');
  const resolveAccent = useAccentColorResolver();
  const resolvedAccentColor = useResolvedAccentColor();
  const filterColor = filter.color ? resolveAccent(filter.color) : resolvedAccentColor;

  return (
    <button
      type="button"
      data-context-menu
      onClick={onSelect}
      onContextMenu={onContextMenu}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
        isActive
          ? 'bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-surface-100'
          : `text-surface-600 dark:text-surface-400 ${!isAnyModalOpen ? 'hover:bg-surface-200 dark:hover:bg-surface-700' : ''}`
      }`}
    >
      {filter.emoji ? (
        <span className="text-xs leading-none" style={{ color: filterColor }}>
          {filter.emoji}
        </span>
      ) : (
        <FilterIcon className="w-3.5 h-3.5" style={{ color: filterColor }} />
      )}
      <span className="flex-1 text-left truncate">{filter.name}</span>
      <span className="text-xs">{taskCount}</span>
    </button>
  );
};
