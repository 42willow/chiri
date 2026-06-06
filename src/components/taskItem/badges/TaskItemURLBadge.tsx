import { openUrl } from '@tauri-apps/plugin-opener';
import Link from 'lucide-react/icons/link';

export const TaskItemURLBadge = ({ url }: { url: string }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      openUrl(url);
    }}
    className="inline-flex items-center gap-1 rounded-sm border border-surface-200 bg-surface-100 px-2 py-0.5 font-medium text-surface-500 text-xs outline-hidden transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset dark:border-surface-600 dark:bg-surface-700 dark:text-surface-400 dark:hover:bg-surface-600"
    title={url}
  >
    <Link className="h-3 w-3 text-primary-500" />
    URL
  </button>
);
