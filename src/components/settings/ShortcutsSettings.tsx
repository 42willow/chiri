import Pencil from 'lucide-react/icons/pencil';
import PencilLine from 'lucide-react/icons/pencil-line';
import RotateCcw from 'lucide-react/icons/rotate-ccw';
import { useEffect, useState } from 'react';
import { KeyboardShortcutModal } from '$components/modals/KeyboardShortcutModal';
import { Tooltip } from '$components/Tooltip';
import { DEFAULT_SHORTCUTS } from '$constants';
import { useSettingsStore } from '$context/settingsContext';
import type { KeyboardShortcut } from '$types';
import { formatShortcut, keyboardShortcutsMatch } from '$utils/keyboard';
import { isMacPlatform } from '$utils/platform';

const SHORTCUT_GROUPS: { label: string; ids: string[] }[] = [
  {
    label: 'Tasks',
    ids: [
      'new-task',
      'select-all-tasks',
      'delete',
      'toggle-complete',
      'toggle-show-completed',
      'toggle-show-unstarted',
    ],
  },
  {
    label: 'Navigation',
    ids: ['nav-up', 'nav-down', 'nav-prev-list', 'nav-next-list', 'toggle-sidebar', 'search'],
  },
  {
    label: 'General',
    ids: ['sync', 'import-tasks', 'settings', 'keyboard-shortcuts'],
  },
];

export const ShortcutsSettings = ({
  onEditingShortcutChange,
}: {
  onEditingShortcutChange?: (editing: boolean) => void;
}) => {
  const { keyboardShortcuts, updateShortcut, resetShortcuts, ensureLatestShortcuts } =
    useSettingsStore();
  const [editingShortcut, setEditingShortcut] = useState<KeyboardShortcut | null>(null);
  const hasCustomShortcuts = !keyboardShortcutsMatch(keyboardShortcuts, DEFAULT_SHORTCUTS);
  const resetTitle = hasCustomShortcuts
    ? 'Reset to defaults'
    : 'Keyboard shortcuts are already using defaults';

  // Ensure shortcuts are up-to-date with defaults when component mounts
  useEffect(() => {
    ensureLatestShortcuts();
  }, [ensureLatestShortcuts]);

  const handleSave = (id: string, updates: Partial<KeyboardShortcut>) => {
    updateShortcut(id, updates);
    setEditingShortcut(null);
    onEditingShortcutChange?.(false);
  };

  const handleOpenEdit = (shortcut: KeyboardShortcut) => {
    setEditingShortcut(shortcut);
    onEditingShortcutChange?.(true);
  };

  const handleCloseEdit = () => {
    setEditingShortcut(null);
    onEditingShortcutChange?.(false);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-row items-center justify-between">
          <h3 className="font-semibold text-base text-surface-800 dark:text-surface-200">
            Keyboard shortcuts
          </h3>
          <Tooltip content={resetTitle} position="bottom" allowInModal>
            <button
              type="button"
              onClick={resetShortcuts}
              disabled={!hasCustomShortcuts}
              aria-label={resetTitle}
              className="flex items-center gap-1.5 rounded-sm bg-surface-100 px-2 py-1 text-surface-700 text-xs outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset enabled:hover:bg-surface-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-surface-700 dark:text-surface-300 dark:enabled:hover:bg-surface-600"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to defaults
            </button>
          </Tooltip>
        </div>

        <div className="space-y-6">
          {SHORTCUT_GROUPS.map((group) => {
            const shortcuts = group.ids
              .map((id) => keyboardShortcuts.find((s) => s.id === id))
              .filter((s): s is KeyboardShortcut => s !== undefined);
            if (shortcuts.length === 0) return null;
            return (
              <div key={group.label}>
                <p className="mb-1.5 px-0.5 font-medium text-surface-400 text-xs uppercase tracking-wider dark:text-surface-500">
                  {group.label}
                </p>
                <div className="overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700">
                  {shortcuts.map((shortcut) => {
                    return (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between gap-3 border-surface-100 border-b bg-white px-3 py-2.5 last:border-0 dark:border-surface-700 dark:bg-surface-800"
                      >
                        <span className="min-w-0 text-sm text-surface-600 dark:text-surface-400">
                          {shortcut.description}
                        </span>

                        <div className="flex shrink-0 items-center gap-2">
                          {shortcut.key ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                {formatShortcut(shortcut)
                                  .split(' + ')
                                  .map((key, keyIndex, arr) => (
                                    <span key={key} className="flex items-center gap-1.5">
                                      <kbd className="inline-flex items-center rounded-sm border border-surface-200 bg-surface-100 px-2 py-1 font-mono text-surface-700 text-xs leading-none dark:border-surface-600 dark:bg-surface-700 dark:text-surface-300">
                                        {key}
                                      </kbd>
                                      {keyIndex < arr.length - 1 && !isMacPlatform() && (
                                        <span className="text-surface-400 text-xs">+</span>
                                      )}
                                    </span>
                                  ))}
                              </div>
                              <Tooltip content="Edit shortcut" position="right" allowInModal>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(shortcut)}
                                  aria-label={`Edit shortcut for ${shortcut.description}`}
                                  className="rounded-sm p-1.5 text-surface-400 outline-hidden transition-colors hover:bg-surface-100 hover:text-surface-600 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset dark:hover:bg-surface-700 dark:hover:text-surface-300"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                              </Tooltip>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(shortcut)}
                              className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-medium text-surface-500 text-xs outline-hidden transition-colors hover:bg-surface-100 hover:text-surface-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset dark:text-surface-400 dark:hover:bg-surface-700 dark:hover:text-surface-200"
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                              Set shortcut
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <KeyboardShortcutModal
        isOpen={editingShortcut !== null}
        shortcut={editingShortcut}
        shortcuts={keyboardShortcuts}
        onClose={handleCloseEdit}
        onSave={handleSave}
      />
    </>
  );
};
