import { useMemo } from 'react';
import { DEFAULT_SORT_CONFIG } from '$constants';
import { useFilteredTasks } from '$hooks/queries/useTasks';
import { useUIState } from '$hooks/queries/useUIState';
import { getSortedTasks } from '$lib/store/filters';
import { getChildTasks } from '$lib/store/tasks';
import { flattenTasks } from '$utils/tree';

export const useVisibleTasks = () => {
  const { data: uiState } = useUIState();
  const { data: filteredTasks = [] } = useFilteredTasks();

  const sortConfig = uiState?.sortConfig ?? DEFAULT_SORT_CONFIG;
  const showCompletedTasks = uiState?.showCompletedTasks ?? true;
  const activeView = uiState?.activeView ?? 'tasks';

  return useMemo(() => {
    const topLevelTasks = filteredTasks.filter((task) => !task.parentUid);
    const sortedTopLevel = getSortedTasks(topLevelTasks, sortConfig);

    const getFilteredChildTasks = (parentUid: string) => {
      const children = getChildTasks(parentUid).filter((task) =>
        activeView === 'recently-deleted' ? !!task.deletedAt : !task.deletedAt,
      );
      if (!showCompletedTasks) {
        return children.filter(
          (task) => task.status !== 'completed' && task.status !== 'cancelled',
        );
      }
      return children;
    };

    return flattenTasks(sortedTopLevel, getFilteredChildTasks, (tasks) =>
      getSortedTasks(tasks, sortConfig),
    );
  }, [activeView, filteredTasks, showCompletedTasks, sortConfig]);
};
