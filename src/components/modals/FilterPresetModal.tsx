import { ModalButton } from '$components/ModalButton';
import { ModalWrapper } from '$components/ModalWrapper';
import { FILTER_PRESET_DEFINITIONS } from '$constants/filters';
import { getIconByName } from '$constants/icons';
import { useResolvedAccentColor } from '$hooks/ui/useResolvedAccentColor';
import type { FilterPresetDefinition } from '$types/filter';

interface FilterPresetModalProps {
  existingPresetIds: Set<string>;
  onCreatePreset: (preset: FilterPresetDefinition) => void;
  onClose: () => void;
}

export const FilterPresetModal = ({
  existingPresetIds,
  onCreatePreset,
  onClose,
}: FilterPresetModalProps) => {
  const accentColor = useResolvedAccentColor();

  return (
    <ModalWrapper
      onClose={onClose}
      title="New Filter"
      size="sm"
      zIndex="z-60"
      contentPadding={false}
      footer={
        <ModalButton variant="ghost" onClick={onClose}>
          Cancel
        </ModalButton>
      }
    >
      <div className="p-2">
        {FILTER_PRESET_DEFINITIONS.map((preset) => {
          const PresetIcon = getIconByName(preset.icon ?? 'list-todo');
          const isAlreadyAdded = existingPresetIds.has(preset.presetId);

          return (
            <button
              key={preset.presetId}
              type="button"
              disabled={isAlreadyAdded}
              onClick={() => {
                if (isAlreadyAdded) return;
                onCreatePreset(preset);
                onClose();
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-surface-700 transition-colors hover:bg-surface-100 outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset disabled:cursor-not-allowed disabled:text-surface-400 disabled:hover:bg-transparent dark:text-surface-300 dark:hover:bg-surface-700 dark:disabled:text-surface-500 dark:disabled:hover:bg-transparent"
            >
              <PresetIcon className="size-4 shrink-0" style={{ color: accentColor }} />
              <span className="min-w-0 flex-1 truncate">{preset.name}</span>
              {isAlreadyAdded && <span className="text-xs text-surface-500">Added</span>}
            </button>
          );
        })}
      </div>
    </ModalWrapper>
  );
};
