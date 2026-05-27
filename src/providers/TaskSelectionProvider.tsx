import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { TaskSelectionContext } from '$context/taskSelectionContext';

const uniqueTaskIds = (taskIds: string[]) => Array.from(new Set(taskIds));

export const TaskSelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [anchorTaskId, setAnchorTaskId] = useState<string | null>(null);

  const setSelection = useCallback((taskIds: string[], nextAnchorTaskId?: string | null) => {
    const nextTaskIds = uniqueTaskIds(taskIds);
    setSelectedTaskIds(nextTaskIds);
    setAnchorTaskId(
      nextTaskIds.length > 0 ? (nextAnchorTaskId ?? nextTaskIds[nextTaskIds.length - 1]) : null,
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
    setAnchorTaskId(null);
  }, []);

  const selectedTaskIdSet = useMemo(() => new Set(selectedTaskIds), [selectedTaskIds]);

  const value = useMemo(
    () => ({
      selectedTaskIds,
      selectedTaskIdSet,
      anchorTaskId,
      setSelection,
      clearSelection,
    }),
    [anchorTaskId, clearSelection, selectedTaskIdSet, selectedTaskIds, setSelection],
  );

  return <TaskSelectionContext.Provider value={value}>{children}</TaskSelectionContext.Provider>;
};
