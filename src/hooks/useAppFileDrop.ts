import { useCallback, useMemo, useState } from 'react';
import { type FileDropResult, useFileDrop } from '$hooks/system/useFileDrop';
import type { CalDAVConfig } from '$utils/mobileconfig';

type AccountModalZIndex = 'z-60' | 'z-70';

interface UseAppFileDropOptions {
  isAnyModalOpen: boolean;
  isImportOpen: boolean;
  setShowImport: (showImport: boolean) => void;
  setShowAccountModal: (showAccountModal: boolean) => void;
  setEditingAccountId: (accountId: string | null) => void;
  setAccountModalZIndex: (zIndex: AccountModalZIndex) => void;
}

export const useAppFileDrop = ({
  isAnyModalOpen,
  isImportOpen,
  setShowImport,
  setShowAccountModal,
  setEditingAccountId,
  setAccountModalZIndex,
}: UseAppFileDropOptions) => {
  const [preloadedFile, setPreloadedFile] = useState<FileDropResult | null>(null);
  const [preloadedConfig, setPreloadedConfig] = useState<CalDAVConfig | null>(null);
  const canHandleGlobalFileDrop = !isAnyModalOpen && !isImportOpen;

  const handleImportClose = useCallback(() => {
    setShowImport(false);
    setPreloadedFile(null);
  }, [setShowImport]);

  const clearPreloadedConfig = useCallback(() => {
    setPreloadedConfig(null);
  }, []);

  const handleDroppedFile = useCallback(
    (file: FileDropResult) => {
      if (!canHandleGlobalFileDrop) return;

      setPreloadedFile(file);
      setShowImport(true);
    },
    [canHandleGlobalFileDrop, setShowImport],
  );

  const handleDroppedConfigProfile = useCallback(
    (config: CalDAVConfig) => {
      if (!canHandleGlobalFileDrop) return;

      setPreloadedConfig(config);
      setEditingAccountId(null);
      setAccountModalZIndex('z-60');
      setShowAccountModal(true);
    },
    [canHandleGlobalFileDrop, setAccountModalZIndex, setEditingAccountId, setShowAccountModal],
  );

  const {
    isDragOver,
    isUnsupportedFile,
    handleFileDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    clearDragState,
  } = useFileDrop({
    onFileDrop: handleDroppedFile,
    onConfigProfileDrop: handleDroppedConfigProfile,
  });

  const rootFileDropProps = useMemo(
    () => ({
      onDrop: handleFileDrop,
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
    }),
    [handleFileDrop, handleDragOver, handleDragEnter, handleDragLeave],
  );

  return {
    preloadedFile,
    preloadedConfig,
    canHandleGlobalFileDrop,
    isDragOver,
    isUnsupportedFile,
    clearDragState,
    clearPreloadedConfig,
    handleImportClose,
    rootFileDropProps,
  };
};
