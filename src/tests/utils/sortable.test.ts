import { describe, expect, it } from 'vitest';
import { getSortableItemDisabled, getSortableItemId, getSortableItemKey } from '$utils/sortable';

describe('sortable helpers', () => {
  it('keeps normal sortable items on their task id', () => {
    expect(getSortableItemId('task-c')).toBe('task-c');
  });

  it('gives drag overlays a separate sortable id', () => {
    expect(getSortableItemId('task-c', true)).toBe('task-c:drag-overlay');
  });

  it('keys sortable item renders by parent', () => {
    expect(getSortableItemKey('task-c')).toBe('task-c:root');
    expect(getSortableItemKey('task-c', 'task-b-uid')).toBe('task-c:task-b-uid');
  });

  it('disables both draggable and droppable behavior for overlays', () => {
    expect(getSortableItemDisabled(true, true)).toEqual({
      draggable: true,
      droppable: true,
    });
  });

  it('enables both sortable behaviors for active rows', () => {
    expect(getSortableItemDisabled(true)).toEqual({
      draggable: false,
      droppable: false,
    });
  });
});
