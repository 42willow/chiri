import PanelLeftClose from 'lucide-react/icons/panel-left-close';
import PanelLeftOpen from 'lucide-react/icons/panel-left-open';
import AppIcon from '$components/Icon';
import { Tooltip } from '$components/Tooltip';

interface SidebarHeaderProps {
  isCollapsed: boolean;
  showExpandedContent: boolean;
  onToggleCollapse: () => void;
}

export const SidebarHeader = ({
  isCollapsed,
  showExpandedContent,
  onToggleCollapse,
}: SidebarHeaderProps) => (
  <div className="flex h-13.25 shrink-0 items-center justify-center border-surface-200 border-b px-2 dark:border-surface-700">
    {isCollapsed ? (
      <Tooltip content="Expand sidebar" position="right">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-lg p-2 text-surface-500 outline-hidden transition-colors hover:bg-surface-200 hover:text-surface-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset dark:text-surface-400 dark:hover:bg-surface-700 dark:hover:text-surface-200"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      </Tooltip>
    ) : (
      <div
        className={`flex flex-1 items-center px-2 motion-safe:transition-opacity motion-safe:duration-150 ${showExpandedContent ? 'opacity-100' : 'opacity-0'}`}
      >
        <h1 className="flex min-w-0 flex-1 items-center gap-2 font-semibold text-lg text-surface-900 dark:text-surface-100">
          <AppIcon className="h-5 w-5 shrink-0 text-primary-500" />
          <span className="truncate">Chiri</span>
        </h1>
        <Tooltip content="Collapse sidebar" position="bottom">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="shrink-0 rounded-lg p-1.5 text-surface-500 outline-hidden transition-colors hover:bg-surface-200 hover:text-surface-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset dark:text-surface-400 dark:hover:bg-surface-700 dark:hover:text-surface-200"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>
    )}
  </div>
);
