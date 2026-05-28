import { useCallback } from 'react';
import { useConfirmDialog } from '$context/confirmDialogContext';
import { useSettingsStore } from '$context/settingsContext';
import { useDeleteTag } from '$hooks/queries/useTags';
import type { Tag } from '$types';

export const useTagDeletion = () => {
  const deleteTagMutation = useDeleteTag();
  const { confirm, close } = useConfirmDialog();
  const { confirmBeforeDeletion, confirmBeforeDeleteTag } = useSettingsStore();

  const deleteTag = useCallback(
    async (tagId: string, tags: Tag[]) => {
      const tag = tags.find((t) => t.id === tagId);

      if (confirmBeforeDeletion && confirmBeforeDeleteTag) {
        const confirmed = await confirm({
          title: 'Delete tag',
          subtitle: tag?.name,
          message: 'Are you sure? Tasks with this tag will not be affected.',
          confirmLabel: 'Delete',
          cancelLabel: 'Cancel',
          destructive: true,
        });
        if (!confirmed) return false;
      }

      deleteTagMutation.mutate(tagId);
      close();
      return true;
    },
    [close, confirm, confirmBeforeDeleteTag, confirmBeforeDeletion, deleteTagMutation],
  );

  return { deleteTag };
};
