import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RepeatModal } from '$components/modals/RepeatModal';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

vi.mock('$context/settingsContext', () => ({
  useSettingsStore: () => ({ dateFormat: 'MMM d, yyyy', startOfWeek: 'monday' }),
  settingsStore: { getState: () => ({ dateFormat: 'MMM d, yyyy' }) },
}));

vi.mock('$components/ModalWrapper', () => ({
  ModalWrapper: ({
    children,
    footer,
    footerLeft,
  }: {
    children: ReactNode;
    footer?: ReactNode;
    footerLeft?: ReactNode;
  }) => (
    <div>
      {children}
      {footerLeft}
      {footer}
    </div>
  ),
}));

vi.mock('$components/modals/DatePickerModal', () => ({ DatePickerModal: () => null }));

describe('RepeatModal', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('does not offer a remove option before a repeat exists', async () => {
    await act(async () => {
      root.render(
        <RepeatModal
          isOpen
          initialCustom
          onClose={vi.fn()}
          rrule={undefined}
          repeatFrom={0}
          onSave={vi.fn()}
        />,
      );
    });

    expect(container.textContent).not.toContain('Does not repeat');
    expect(container.textContent).not.toContain('Clear');
    expect(container.textContent).toContain('Custom…');
  });

  it('builds an ordinal monthly weekday rule', async () => {
    const onSave = vi.fn();
    await act(async () => {
      root.render(
        <RepeatModal
          isOpen
          onClose={vi.fn()}
          rrule={undefined}
          repeatFrom={0}
          dueDate={new Date(2025, 0, 22, 12)}
          onSave={onSave}
        />,
      );
    });

    const button = (label: string) =>
      Array.from(container.querySelectorAll('button')).find(
        (candidate) => candidate.textContent?.trim() === label,
      );
    await act(async () => button('Monthly')?.click());
    await act(async () => button('Weekday')?.click());

    const [ordinalSelect, weekdaySelect] = Array.from(container.querySelectorAll('select'));
    await act(async () => {
      ordinalSelect.value = '3';
      ordinalSelect.dispatchEvent(new Event('change', { bubbles: true }));
      weekdaySelect.value = 'MO';
      weekdaySelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await act(async () => button('Done')?.click());

    expect(onSave).toHaveBeenCalledWith('FREQ=MONTHLY;BYDAY=3MO', 0);
  });
});
