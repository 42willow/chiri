import { act, createElement, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePreserveScrollOnWindowFocus } from '$hooks/ui/usePreserveScrollOnWindowFocus';

const Probe = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  usePreserveScrollOnWindowFocus(scrollRef);

  return createElement(
    'div',
    null,
    createElement(
      'div',
      {
        ref: scrollRef,
        'data-testid': 'scroll-container',
      },
      createElement('textarea', { 'aria-label': 'Task title', defaultValue: 'Task title' }),
    ),
    createElement('button', { type: 'button', 'aria-label': 'Outside focus target' }),
  );
};

describe('usePreserveScrollOnWindowFocus', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  it('blurs the focused editor element before window blur can scroll it into view', () => {
    act(() => {
      root.render(createElement(Probe));
    });

    const scrollContainer = container.querySelector<HTMLDivElement>(
      '[data-testid="scroll-container"]',
    );
    const textarea = container.querySelector('textarea');

    expect(scrollContainer).not.toBeNull();
    expect(textarea).not.toBeNull();

    act(() => {
      textarea?.focus();
    });

    if (!scrollContainer) throw new Error('missing scroll container');
    scrollContainer.scrollTop = 240;

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    expect(document.activeElement).not.toBe(textarea);
    expect(scrollContainer.scrollTop).toBe(240);
  });

  it('restores the editor focus without scrolling on window focus', () => {
    act(() => {
      root.render(createElement(Probe));
    });

    const scrollContainer = container.querySelector<HTMLDivElement>(
      '[data-testid="scroll-container"]',
    );
    const textarea = container.querySelector('textarea');

    expect(scrollContainer).not.toBeNull();
    expect(textarea).not.toBeNull();

    act(() => {
      textarea?.focus();
    });

    if (!scrollContainer) throw new Error('missing scroll container');
    if (!textarea) throw new Error('missing textarea');

    textarea.setSelectionRange(1, 3);
    scrollContainer.scrollTop = 180;
    vi.spyOn(textarea, 'focus').mockImplementation((options?: FocusOptions) => {
      if (!options?.preventScroll) {
        scrollContainer.scrollTop = 0;
      }

      HTMLTextAreaElement.prototype.focus.call(textarea, options);
    });

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    expect(document.activeElement).not.toBe(textarea);

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });

    expect(textarea.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(document.activeElement).toBe(textarea);
    expect(scrollContainer.scrollTop).toBe(180);
    expect(textarea.selectionStart).toBe(1);
    expect(textarea.selectionEnd).toBe(3);
  });

  it('keeps the saved editor focus across duplicate blur signals', () => {
    act(() => {
      root.render(createElement(Probe));
    });

    const textarea = container.querySelector('textarea');

    expect(textarea).not.toBeNull();

    act(() => {
      textarea?.focus();
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('focus'));
    });

    expect(document.activeElement).toBe(textarea);
  });

  it('does not blur focus outside the scroll container', () => {
    act(() => {
      root.render(createElement(Probe));
    });

    const scrollContainer = container.querySelector<HTMLDivElement>(
      '[data-testid="scroll-container"]',
    );

    expect(scrollContainer).not.toBeNull();

    const outsideButton = container.querySelector<HTMLButtonElement>(
      '[aria-label="Outside focus target"]',
    );
    expect(outsideButton).not.toBeNull();

    if (!scrollContainer) throw new Error('missing scroll container');
    scrollContainer.scrollTop = 200;

    act(() => {
      outsideButton?.focus();
      window.dispatchEvent(new Event('blur'));
    });

    expect(document.activeElement).toBe(outsideButton);
    expect(scrollContainer.scrollTop).toBe(200);
  });
});
