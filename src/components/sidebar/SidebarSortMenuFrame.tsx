import type { ReactNode, RefObject } from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface SidebarSortMenuFrameProps {
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
}

const VIEWPORT_PADDING = 8;
const ANCHOR_GAP = 4;
const FALLBACK_MENU_WIDTH = 200;
const FALLBACK_MENU_HEIGHT = 260;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

export const SidebarSortMenuFrame = ({
  anchorRef,
  onClose,
  children,
}: SidebarSortMenuFrameProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: VIEWPORT_PADDING, top: VIEWPORT_PADDING });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const anchorRect = anchor.getBoundingClientRect();
    const menuRect = menuRef.current?.getBoundingClientRect();
    const menuWidth = menuRect?.width ?? FALLBACK_MENU_WIDTH;
    const menuHeight = menuRect?.height ?? FALLBACK_MENU_HEIGHT;
    const maxLeft = window.innerWidth - menuWidth - VIEWPORT_PADDING;
    const maxTop = window.innerHeight - menuHeight - VIEWPORT_PADDING;

    const left = anchorRect.right - menuWidth;
    let top = anchorRect.bottom + ANCHOR_GAP;

    const spaceBelow = window.innerHeight - anchorRect.bottom - ANCHOR_GAP - VIEWPORT_PADDING;
    const spaceAbove = anchorRect.top - ANCHOR_GAP - VIEWPORT_PADDING;
    if (menuHeight > spaceBelow && spaceAbove > spaceBelow) {
      top = anchorRect.top - menuHeight - ANCHOR_GAP;
    }

    setPosition({
      left: clamp(left, VIEWPORT_PADDING, maxLeft),
      top: clamp(top, VIEWPORT_PADDING, maxTop),
    });
  }, [anchorRef]);

  useLayoutEffect(() => {
    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);

    window.addEventListener('resize', updatePosition, true);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition, true);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [updatePosition]);

  return createPortal(
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Sort menu backdrop for closing on outside click */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Sort menu backdrop for closing on outside click */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Sort menu container stops backdrop clicks */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Sort menu container stops backdrop clicks */}
      <div
        ref={menuRef}
        data-context-menu-content
        className="fixed bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 z-50 min-w-50 animate-scale-in"
        style={{ left: position.left, top: position.top }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body,
  );
};
