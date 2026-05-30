import { useEffect, useLayoutEffect } from 'react';

const RESET_CURSOR_CLASS = 'chiri-reset-cursor';
let cursorResetToken = 0;

interface ResetStaleCursorOptions {
  frames?: number;
}

interface ResetStaleCursorIfNeededOptions {
  delayFrames?: number;
}

const CLOSE_RESET_FRAMES = 8;
const POINTER_TARGET_SELECTOR = [
  'a[href]:not([aria-disabled="true"])',
  'button:not(:disabled):not([aria-disabled="true"])',
  'input[type="button"]:not(:disabled)',
  'input[type="checkbox"]:not(:disabled)',
  'input[type="color"]:not(:disabled)',
  'input[type="file"]:not(:disabled)',
  'input[type="radio"]:not(:disabled)',
  'input[type="range"]:not(:disabled)',
  'input[type="reset"]:not(:disabled)',
  'input[type="submit"]:not(:disabled)',
  'select:not(:disabled)',
  'summary',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="menuitem"]:not([aria-disabled="true"])',
  '[role="option"]:not([aria-disabled="true"])',
  'label:has(input[type="checkbox"]:not(:disabled))',
  'label:has(input[type="radio"]:not(:disabled))',
  '.cursor-pointer:not(:disabled):not([aria-disabled="true"])',
].join(',');

interface CursorEventPoint {
  clientX: number;
  clientY: number;
}

interface CursorPointerEvent extends CursorEventPoint {
  target: EventTarget | null;
}

const resetStaleCursor = ({ frames = 2 }: ResetStaleCursorOptions = {}) => {
  const root = document.documentElement;
  const token = ++cursorResetToken;
  root.classList.add(RESET_CURSOR_CLASS);

  const frameIds: number[] = [];
  const scheduleRemoval = (remainingFrames: number) => {
    const frameId = window.requestAnimationFrame(() => {
      if (remainingFrames > 1) {
        scheduleRemoval(remainingFrames - 1);
        return;
      }

      if (cursorResetToken === token) {
        root.classList.remove(RESET_CURSOR_CLASS);
      }
    });

    frameIds.push(frameId);
  };

  scheduleRemoval(frames);

  return () => {
    for (const frameId of frameIds) {
      window.cancelAnimationFrame(frameId);
    }

    if (cursorResetToken === token) {
      root.classList.remove(RESET_CURSOR_CLASS);
    }
  };
};

export const resetStaleCursorOnClose = () => resetStaleCursor({ frames: CLOSE_RESET_FRAMES });

const resetStaleCursorIfNeededAtPoint = (
  x: number,
  y: number,
  { delayFrames = 1 }: ResetStaleCursorIfNeededOptions = {},
) => {
  const frameIds: number[] = [];
  const scheduleCheck = (remainingFrames: number) => {
    const frameId = window.requestAnimationFrame(() => {
      if (remainingFrames > 1) {
        scheduleCheck(remainingFrames - 1);
        return;
      }

      const element = document.elementFromPoint(x, y);
      if (!element) return;
      if (window.getComputedStyle(element).cursor !== 'pointer') resetStaleCursor();
    });

    frameIds.push(frameId);
  };

  scheduleCheck(delayFrames);

  return () => {
    for (const frameId of frameIds) {
      window.cancelAnimationFrame(frameId);
    }
  };
};

const isPointerInteractionTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false;
  if (window.getComputedStyle(target).cursor === 'pointer') return true;

  return target.closest(POINTER_TARGET_SELECTOR) !== null;
};

export const resetStaleCursorIfNeededAtEventPoint = (
  { clientX, clientY }: CursorEventPoint,
  options?: ResetStaleCursorIfNeededOptions,
) => resetStaleCursorIfNeededAtPoint(clientX, clientY, options);

export const resetStaleCursorAfterPointerInteraction = ({
  target,
  clientX,
  clientY,
}: CursorPointerEvent) => {
  if (!isPointerInteractionTarget(target)) return;

  return resetStaleCursorIfNeededAtPoint(clientX, clientY);
};

export const useResetStaleCursorAfterPointerInteraction = () => {
  useEffect(() => {
    const handlePointerInteraction = (event: MouseEvent) => {
      resetStaleCursorAfterPointerInteraction(event);
    };

    document.addEventListener('click', handlePointerInteraction, true);
    document.addEventListener('contextmenu', handlePointerInteraction, true);

    return () => {
      document.removeEventListener('click', handlePointerInteraction, true);
      document.removeEventListener('contextmenu', handlePointerInteraction, true);
    };
  }, []);
};

export const useResetStaleCursorOnOpen = (isOpen: boolean) => {
  useLayoutEffect(() => {
    if (!isOpen) return;

    return resetStaleCursor();
  }, [isOpen]);
};
