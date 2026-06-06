import AlignLeft from 'lucide-react/icons/align-left';
import { useRef } from 'react';
import { ComposedTextarea } from '$components/ComposedTextarea';
import { useDebouncedTaskUpdate } from '$hooks/ui/useDebouncedTaskUpdate';
import { filterCalDavDescription } from '$lib/ical/vtodo';
import type { Task } from '$types';

interface DescriptionProps {
  task: Task;
  readOnly?: boolean;
}

export const TaskEditorDescription = ({ task, readOnly = false }: DescriptionProps) => {
  const [pendingDescription, updatePendingDescription] = useDebouncedTaskUpdate(
    task.id,
    'description',
    task.description ?? '',
  );

  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const handleDescriptionChange = (value: string, cursorPos?: number | null) => {
    updatePendingDescription(value);
    requestAnimationFrame(() => {
      if (descriptionRef.current && cursorPos !== null && cursorPos !== undefined) {
        descriptionRef.current.setSelectionRange(cursorPos, cursorPos);
      }
    });
  };

  const description = filterCalDavDescription(pendingDescription);

  return (
    <div>
      <label
        htmlFor={readOnly ? undefined : 'task-description'}
        className="mb-2 flex items-center gap-2 font-medium text-sm text-surface-600 dark:text-surface-400"
      >
        <AlignLeft className="h-4 w-4" />
        Description
      </label>
      {readOnly ? (
        <div className="selectable min-h-24 w-full cursor-not-allowed whitespace-pre-wrap rounded-lg border border-transparent bg-surface-100 px-3 py-2 text-sm text-surface-700 dark:bg-surface-800 dark:text-surface-300">
          {description || (
            <span className="text-surface-400 dark:text-surface-500">No description</span>
          )}
        </div>
      ) : (
        <ComposedTextarea
          ref={descriptionRef}
          id="task-description"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="Add a description..."
          rows={4}
          className="w-full resize-none rounded-lg border border-transparent bg-surface-100 px-3 py-2 text-sm text-surface-700 transition-colors focus:border-primary-500 focus:bg-white focus:outline-hidden dark:bg-surface-800 dark:text-surface-300 dark:focus:bg-surface-800"
        />
      )}
    </div>
  );
};
