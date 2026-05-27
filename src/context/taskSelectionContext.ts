import { createContext, useContext } from 'react';

interface TaskSelectionContextValue {
  selectedTaskIds: string[];
  selectedTaskIdSet: Set<string>;
  anchorTaskId: string | null;
  setSelection: (taskIds: string[], anchorTaskId?: string | null) => void;
  clearSelection: () => void;
}

const emptySet = new Set<string>();

export const TaskSelectionContext = createContext<TaskSelectionContextValue | null>(null);

export const useTaskSelection = () => {
  const context = useContext(TaskSelectionContext);

  return (
    context ?? {
      selectedTaskIds: [],
      selectedTaskIdSet: emptySet,
      anchorTaskId: null,
      setSelection: () => {},
      clearSelection: () => {},
    }
  );
};
