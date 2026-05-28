import { useCallback } from 'react';
import { useConfirmDialog } from '$context/confirmDialogContext';
import { useSettingsStore } from '$context/settingsContext';
import { useDeleteAccount } from '$hooks/queries/useAccounts';
import type { Account } from '$types';

export const useAccountDeletion = () => {
  const deleteAccountMutation = useDeleteAccount();
  const { confirm, close } = useConfirmDialog();
  const { confirmBeforeDeletion, confirmBeforeDeleteAccount } = useSettingsStore();

  const deleteAccount = useCallback(
    async (accountId: string, accounts: Account[]) => {
      const account = accounts.find((a) => a.id === accountId);

      if (confirmBeforeDeletion && confirmBeforeDeleteAccount) {
        const confirmed = await confirm({
          title: 'Remove account',
          subtitle: account?.name,
          message:
            'Are you sure? All tasks from this account will be removed from the app. They will remain on the server.',
          confirmLabel: 'Remove',
          cancelLabel: 'Cancel',
          destructive: true,
        });
        if (!confirmed) return false;
      }

      deleteAccountMutation.mutate(accountId);
      close();
      return true;
    },
    [close, confirm, confirmBeforeDeletion, confirmBeforeDeleteAccount, deleteAccountMutation],
  );

  return { deleteAccount };
};
