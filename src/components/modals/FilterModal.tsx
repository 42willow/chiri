import { useState } from 'react';
import { ColorSwatchPicker } from '$components/ColorSwatchPicker';
import { ComposedInput } from '$components/ComposedInput';
import { IconEmojiPicker } from '$components/IconEmojiPicker';
import { ModalButton } from '$components/ModalButton';
import { ModalWrapper } from '$components/ModalWrapper';
import { useFilters, useUpdateFilter } from '$hooks/queries/useFilters';
import { useColorPresets } from '$hooks/ui/useColorPresets';
import { useInitialFocusRef } from '$hooks/ui/useInitialFocusRef';
import { useAccentColorResolver, useResolvedAccentColor } from '$hooks/ui/useResolvedAccentColor';

interface FilterModalProps {
  filterId: string;
  onClose: () => void;
}

export const FilterModal = ({ filterId, onClose }: FilterModalProps) => {
  const { data: filters = [] } = useFilters();
  const updateFilterMutation = useUpdateFilter();
  const colorPresets = useColorPresets();
  const resolveAccentColor = useAccentColorResolver();
  const resolvedAccentColor = useResolvedAccentColor();

  const existingFilter = filters.find((filter) => filter.id === filterId);
  const initialColor = resolveAccentColor(existingFilter?.color ?? resolvedAccentColor);

  const [name, setName] = useState(existingFilter?.name ?? '');
  const [color, setColor] = useState(initialColor);
  const [icon, setIcon] = useState(existingFilter?.icon ?? 'list-todo');
  const [emoji, setEmoji] = useState(existingFilter?.emoji ?? '');
  const nameInputRef = useInitialFocusRef<HTMLInputElement>();

  if (!existingFilter) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateFilterMutation.mutate({
      id: existingFilter.id,
      updates: { name, color, icon, emoji, presetId: undefined },
    });
    onClose();
  };

  return (
    <ModalWrapper
      onClose={onClose}
      title="Edit Filter"
      size="md"
      className="max-w-120"
      zIndex="z-60"
      contentPadding={false}
      footer={
        <>
          <ModalButton variant="ghost" onClick={onClose}>
            Cancel
          </ModalButton>
          <ModalButton type="submit" form="filter-form" disabled={!name.trim()}>
            Save
          </ModalButton>
        </>
      }
    >
      <form id="filter-form" onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label
            htmlFor="filter-name"
            className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
          >
            Filter Name
          </label>
          <div className="flex items-center gap-2">
            <IconEmojiPicker
              iconValue={icon}
              emojiValue={emoji}
              onIconChange={setIcon}
              onEmojiChange={setEmoji}
              color={color}
            />
            <ComposedInput
              ref={nameInputRef}
              id="filter-name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Filter name"
              required
              className="flex-1 px-3 py-2 text-sm text-surface-800 dark:text-surface-200 bg-surface-100 dark:bg-surface-700 border border-transparent rounded-lg focus:outline-hidden focus:border-primary-500 focus:bg-white dark:focus:bg-surface-800 transition-colors"
            />
          </div>
        </div>

        <div>
          <p className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Color
          </p>
          <ColorSwatchPicker
            options={colorPresets.map((preset) => ({
              id: preset,
              value: preset,
              label: preset,
            }))}
            value={color}
            colorInputValue={color}
            onSelect={setColor}
            onCustomChange={setColor}
          />
        </div>
      </form>
    </ModalWrapper>
  );
};
