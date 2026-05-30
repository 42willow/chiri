import type { DragEventHandler, MouseEventHandler, ReactNode } from 'react';
import { resetStaleCursorAfterPointerInteraction } from '$hooks/ui/useResetCursorOnOpen';

interface ModalBackdropProps {
  children: ReactNode;
  onClose?: () => void;
  onDrop?: DragEventHandler<HTMLDivElement>;
  onDragOver?: DragEventHandler<HTMLDivElement>;
  onDragLeave?: DragEventHandler<HTMLDivElement>;
  className?: string;
  backdropClassName?: string;
  zIndex?: string;
  /** Whether clicking the backdrop closes the modal. Default: false */
  closeOnBackdropClick?: boolean;
}

/**
 * Accessible modal backdrop component.
 * Uses a button element for the backdrop to satisfy accessibility requirements.
 * By default, clicking the backdrop does NOT close the modal - users close via X button or Escape key.
 */
export const ModalBackdrop = ({
  children,
  onClose,
  onDrop,
  onDragOver,
  onDragLeave,
  className = '',
  backdropClassName = 'bg-black/50',
  zIndex = 'z-60',
  closeOnBackdropClick = false,
}: ModalBackdropProps) => {
  const handleClickCapture: MouseEventHandler<HTMLDivElement> = (event) => {
    // WebKit can keep a clicked control's pointer cursor after modal content
    // changes under a stationary mouse. Wait for click handlers to settle, then
    // only reset if the cursor is no longer over another pointer target.
    resetStaleCursorAfterPointerInteraction(event);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Import modals need drag handlers on the backdrop to prevent browser file navigation.
    <div
      role="presentation"
      className={`fixed inset-0 ${zIndex} flex items-center justify-center animate-fade-in ${className}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClickCapture={handleClickCapture}
    >
      {/* Backdrop button - accessible interactive element */}
      <button
        type="button"
        onClick={closeOnBackdropClick ? onClose : undefined}
        className={`absolute inset-0 cursor-default ${backdropClassName}`}
        aria-label="Close modal"
        tabIndex={-1}
      />
      {/* Modal content container */}
      {children}
    </div>
  );
};
