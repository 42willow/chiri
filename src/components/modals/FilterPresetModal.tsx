import { ModalButton } from '$components/ModalButton';
import { ModalWrapper } from '$components/ModalWrapper';
import { FILTER_PRESET_DEFINITIONS, type FilterPresetDefinition } from '$constants/filters';
import { getIconByName } from '$constants/icons';
import { useResolvedAccentColor } from '$hooks/ui/useResolvedAccentColor';

interface FilterPresetModalProps {
  onCreatePreset: (preset: FilterPresetDefinition) => void;
  onClose: () => void;
}

export const FilterPresetModal = ({ onCreatePreset, onClose }: FilterPresetModalProps) => {
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

          return (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                onCreatePreset(preset);
                onClose();
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-surface-700 transition-colors hover:bg-surface-100 outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset dark:text-surface-300 dark:hover:bg-surface-700"
            >
              <PresetIcon className="size-4 shrink-0" style={{ color: accentColor }} />
              <span className="min-w-0 flex-1 truncate">{preset.name}</span>
            </button>
          );
        })}
      </div>
    </ModalWrapper>
  );
};
