import { useCallback } from 'react';
import { useDeleteTask, usePermanentDeleteTask, useTasks } from '$hooks/queries/useTasks';
import { useSetRecentlyDeletedView } from '$hooks/queries/useUIState';
import { useConfirmDialog } from '$hooks/store/useConfirmDialog';
import { useSettingsStore } from '$hooks/store/useSettingsStore';
import { toastManager } from '$hooks/ui/useToast';
import { pluralize } from '$utils/misc';

export const useTaskDeletion = () => {
  const {
    confirmBeforePermanentDelete,
    deleteSubtasksWithParent,
    hasSeenRecentlyDeletedToast,
    setHasSeenRecentlyDeletedToast,
  } = useSettingsStore();
  const { data: tasks = [] } = useTasks();
  const deleteTaskMutation = useDeleteTask();
  const permanentDeleteTaskMutation = usePermanentDeleteTask();
  const setRecentlyDeletedViewMutation = useSetRecentlyDeletedView();
  const { confirm, close } = useConfirmDialog();

  const moveTaskToRecentlyDeleted = useCallback(
    async (taskId: string | null | undefined) => {
      if (!taskId) return false;

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return false;

      const deleteChildren = deleteSubtasksWithParent === 'delete';
      const isUntitledLocalDraft = !task.title.trim() && !task.href;

      if (isUntitledLocalDraft) {
        permanentDeleteTaskMutation.mutate({ id: taskId, deleteChildren: true });
        return true;
      }

      deleteTaskMutation.mutate({ id: taskId, deleteChildren });
      if (!hasSeenRecentlyDeletedToast) {
        setHasSeenRecentlyDeletedToast(true);
        toastManager.info(
          'Moved to Recently Deleted',
          "Deleted tasks live in the sidebar's Recently Deleted view until you restore or permanently delete them.",
          'recently-deleted-intro',
          {
            label: 'View',
            onClick: () => setRecentlyDeletedViewMutation.mutate(),
          },
        );
      }
      return true;
    },
    [
      deleteSubtasksWithParent,
      deleteTaskMutation,
      hasSeenRecentlyDeletedToast,
      permanentDeleteTaskMutation,
      setHasSeenRecentlyDeletedToast,
      setRecentlyDeletedViewMutation,
      tasks,
    ],
  );

  const deleteTaskPermanently = useCallback(
    async (taskId: string | null | undefined) => {
      if (!taskId) return false;

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return false;

      const deleteChildren = deleteSubtasksWithParent === 'delete';

      if (confirmBeforePermanentDelete) {
        const countAllDescendants = (parentUid: string): number => {
          const children = tasks.filter((t) => t.parentUid === parentUid);
          return children.reduce((acc, child) => acc + 1 + countAllDescendants(child.uid), 0);
        };

        const descendantCount = countAllDescendants(task.uid);
        const message =
          descendantCount > 0 && deleteChildren
            ? `This task has ${descendantCount} ${pluralize(descendantCount, 'subtask')} that will also be permanently deleted. This cannot be undone.`
            : descendantCount > 0
              ? `This task has ${descendantCount} ${pluralize(descendantCount, 'subtask')} that will be kept. This cannot be undone.`
              : 'This will permanently delete the task. This cannot be undone.';

        const confirmed = await confirm({
          title: 'Delete permanently',
          subtitle: task.title || 'Untitled task',
          message,
          confirmLabel: 'Delete permanently',
          cancelLabel: 'Cancel',
          destructive: true,
          delayConfirmSeconds: 1,
        });
        close();
        if (!confirmed) return false;
      }

      permanentDeleteTaskMutation.mutate({ id: taskId, deleteChildren });
      return true;
    },
    [
      close,
      confirm,
      confirmBeforePermanentDelete,
      deleteSubtasksWithParent,
      permanentDeleteTaskMutation,
      tasks,
    ],
  );

  return { moveTaskToRecentlyDeleted, deleteTaskPermanently };
};
