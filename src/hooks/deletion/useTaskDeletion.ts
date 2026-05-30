import { useCallback } from 'react';
import { useConfirmDialog } from '$context/confirmDialogContext';
import { useSettingsStore } from '$context/settingsContext';
import { useDeleteTask, usePermanentDeleteTask, useTasks } from '$hooks/queries/useTasks';
import { useSetRecentlyDeletedView } from '$hooks/queries/useUIState';
import { toastManager } from '$hooks/ui/useToast';
import type { Task } from '$types';
import { pluralize } from '$utils/misc';
import { isDiscardableUntitledLocalDraft } from '$utils/taskDeletion';

const countAllDescendants = (tasks: Task[], parentUid: string): number => {
  const children = tasks.filter((t) => t.parentUid === parentUid);
  return children.reduce((acc, child) => acc + 1 + countAllDescendants(tasks, child.uid), 0);
};

const getPermanentDeleteMessage = (task: Task, tasks: Task[], deleteChildren: boolean) => {
  const descendantCount = countAllDescendants(tasks, task.uid);

  if (descendantCount > 0 && deleteChildren) {
    return `This task has ${descendantCount} ${pluralize(descendantCount, 'subtask')} that will also be permanently deleted. This cannot be undone.`;
  }

  if (descendantCount > 0) {
    return `This task has ${descendantCount} ${pluralize(descendantCount, 'subtask')} that will be kept. This cannot be undone.`;
  }

  return 'This will permanently delete the task. This cannot be undone.';
};

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

      if (isDiscardableUntitledLocalDraft(task, tasks)) {
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

  const deleteTasksPermanently = useCallback(
    async (taskIds: Array<string | null | undefined>) => {
      const seenTaskIds = new Set<string>();
      const tasksToDelete = taskIds.flatMap((taskId) => {
        if (!taskId || seenTaskIds.has(taskId)) return [];
        seenTaskIds.add(taskId);

        const task = tasks.find((t) => t.id === taskId);
        return task ? [task] : [];
      });

      if (tasksToDelete.length === 0) return false;

      const deleteChildren = deleteSubtasksWithParent === 'delete';

      if (confirmBeforePermanentDelete) {
        const taskCount = tasksToDelete.length;
        const message =
          taskCount === 1
            ? getPermanentDeleteMessage(tasksToDelete[0], tasks, deleteChildren)
            : `This will permanently delete ${taskCount} selected ${pluralize(
                taskCount,
                'task',
              )}. This cannot be undone.`;

        const confirmed = await confirm({
          title: 'Delete permanently',
          subtitle:
            taskCount === 1
              ? tasksToDelete[0].title || 'Untitled task'
              : `${taskCount} selected ${pluralize(taskCount, 'task')}`,
          message,
          confirmLabel: 'Delete permanently',
          cancelLabel: 'Cancel',
          destructive: true,
        });
        close();
        if (!confirmed) return false;
      }

      for (const task of tasksToDelete) {
        permanentDeleteTaskMutation.mutate({ id: task.id, deleteChildren });
      }
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

  const deleteTaskPermanently = useCallback(
    (taskId: string | null | undefined) => deleteTasksPermanently([taskId]),
    [deleteTasksPermanently],
  );

  return { moveTaskToRecentlyDeleted, deleteTaskPermanently, deleteTasksPermanently };
};
