import { useCallback } from 'react';
import { useConfirmDialog } from '$hooks/store/useConfirmDialog';
import { deleteDatabase } from '$lib/bootstrap';

export const useDatabaseDeletion = () => {
  const { confirm, close } = useConfirmDialog();

  const deleteLocalDatabase = useCallback(async () => {
    const confirmed = await confirm({
      title: 'Reset Database',
      message: (
        <div className="space-y-2">
          <p>
            <span className="font-bold">Are you sure?</span> This will not affect data on your
            CalDAV servers, but local data will be lost and accounts will need to be set up again.
          </p>
          <p className="text-sm text-semantic-warning">
            Not recommended unless you are experiencing issues or want to start fresh.
          </p>
        </div>
      ),
      confirmLabel: 'Reset Database',
      destructive: true,
      delayConfirmSeconds: 5,
    });

    close();
    if (!confirmed) return false;

    await deleteDatabase();
    return true;
  }, [close, confirm]);

  return { deleteLocalDatabase };
};
