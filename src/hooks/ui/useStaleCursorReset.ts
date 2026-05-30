import { useEffect, useLayoutEffect } from 'react';

const RESET_CURSOR_CLASS = 'chiri-reset-cursor';
let cursorResetToken = 0;

interface ForceStaleCursorRefreshOptions {
  frames?: number;
}

interface RefreshStaleCursorAfterLayoutOptions {
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

const scheduleAfterFrames = (frames: number, callback: () => void) => {
  const frameIds: number[] = [];
  const schedule = (remainingFrames: number) => {
    const frameId = window.requestAnimationFrame(() => {
      if (remainingFrames > 1) {
        schedule(remainingFrames - 1);
        return;
      }

      callback();
    });

    frameIds.push(frameId);
  };

  schedule(frames);

  return () => {
    for (const frameId of frameIds) {
      window.cancelAnimationFrame(frameId);
    }
  };
};

const forceStaleCursorRefresh = ({ frames = 2 }: ForceStaleCursorRefreshOptions = {}) => {
  const root = document.documentElement;
  const token = ++cursorResetToken;
  root.classList.add(RESET_CURSOR_CLASS);

  const cancelRemoval = scheduleAfterFrames(frames, () => {
    if (cursorResetToken === token) {
      root.classList.remove(RESET_CURSOR_CLASS);
    }
  });

  return () => {
    cancelRemoval();

    if (cursorResetToken === token) {
      root.classList.remove(RESET_CURSOR_CLASS);
    }
  };
};

export const resetStaleCursorOnLayerClose = () =>
  forceStaleCursorRefresh({ frames: CLOSE_RESET_FRAMES });

const refreshStaleCursorAfterLayoutAtPoint = (
  x: number,
  y: number,
  { delayFrames = 1 }: RefreshStaleCursorAfterLayoutOptions = {},
) => {
  return scheduleAfterFrames(delayFrames, () => {
    if (!isPointOverPointerCursor(x, y)) forceStaleCursorRefresh();
  });
};

const isPointOverPointerCursor = (x: number, y: number) => {
  const element = document.elementFromPoint(x, y);
  if (!element) return true;

  return window.getComputedStyle(element).cursor === 'pointer';
};

const didPointerMutationStartFromPointerTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) return false;
  if (window.getComputedStyle(target).cursor === 'pointer') return true;

  return target.closest(POINTER_TARGET_SELECTOR) !== null;
};

export const refreshStaleCursorAfterLayoutAtEventPoint = (
  { clientX, clientY }: CursorEventPoint,
  options?: RefreshStaleCursorAfterLayoutOptions,
) => refreshStaleCursorAfterLayoutAtPoint(clientX, clientY, options);

export const refreshStaleCursorAfterPointerMutation = ({
  target,
  clientX,
  clientY,
}: CursorPointerEvent) => {
  if (!didPointerMutationStartFromPointerTarget(target)) return;

  return refreshStaleCursorAfterLayoutAtPoint(clientX, clientY);
};

export const useRefreshStaleCursorAfterPointerMutation = () => {
  useEffect(() => {
    const handlePointerInteraction = (event: MouseEvent) => {
      refreshStaleCursorAfterPointerMutation(event);
    };

    document.addEventListener('click', handlePointerInteraction, true);
    document.addEventListener('contextmenu', handlePointerInteraction, true);

    return () => {
      document.removeEventListener('click', handlePointerInteraction, true);
      document.removeEventListener('contextmenu', handlePointerInteraction, true);
    };
  }, []);
};

export const useResetStaleCursorOnLayerOpen = (isOpen: boolean) => {
  useLayoutEffect(() => {
    if (!isOpen) return;

    return forceStaleCursorRefresh();
  }, [isOpen]);
};
