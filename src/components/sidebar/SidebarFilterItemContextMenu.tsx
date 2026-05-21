import Edit2 from 'lucide-react/icons/edit-2';
import Trash2 from 'lucide-react/icons/trash-2';

interface SidebarFilterItemContextMenuProps {
  filterId: string;
  onClose: () => void;
  onEditFilter: (filterId: string) => void;
  onDeleteFilter: (filterId: string) => void;
}

export const SidebarFilterItemContextMenu = ({
  filterId,
  onClose,
  onEditFilter,
  onDeleteFilter,
}: SidebarFilterItemContextMenuProps) => (
  <>
    <button
      type="button"
      onClick={() => {
        onEditFilter(filterId);
        onClose();
      }}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
    >
      <Edit2 className="w-4 h-4" />
      Edit Filter
    </button>

    <div className="border-t border-surface-200 dark:border-surface-700" />

    <button
      type="button"
      onClick={() => {
        onDeleteFilter(filterId);
        onClose();
      }}
      className="w-full rounded-b-md flex items-center gap-2 px-3 py-2 text-sm text-semantic-error hover:bg-semantic-error/15 outline-hidden focus-visible:ring-2 focus-visible:ring-semantic-error focus-visible:ring-inset"
    >
      <Trash2 className="w-4 h-4" />
      Delete
    </button>
  </>
);
