import type { CSSProperties, ReactNode, RefObject } from 'react';
import { FloatingLayerFrame } from '$components/FloatingLayerFrame';
import type { DismissableLayerType } from '$context/dismissableLayerContext';

interface FloatingDropdownFrameProps {
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
  align?: 'start' | 'end';
  gap?: number;
  viewportPadding?: number;
  fallbackWidth?: number;
  fallbackHeight?: number;
  backdropClassName?: string;
  dropdownClassName?: string;
  dropdownStyle?: CSSProperties;
  dataAttribute?: string;
  closeOnEscape?: boolean;
  layerType?: Extract<DismissableLayerType, 'dropdown' | 'context-menu'>;
  resetCursorOnOpen?: boolean;
}

export const FloatingDropdownFrame = ({
  anchorRef,
  onClose,
  children,
  align = 'end',
  gap,
  viewportPadding,
  fallbackWidth,
  fallbackHeight,
  backdropClassName,
  dropdownClassName,
  dropdownStyle,
  dataAttribute,
  closeOnEscape,
  layerType,
  resetCursorOnOpen,
}: FloatingDropdownFrameProps) => (
  <FloatingLayerFrame
    anchor={{ type: 'element', ref: anchorRef, align, gap }}
    onClose={onClose}
    viewportPadding={viewportPadding}
    fallbackWidth={fallbackWidth}
    fallbackHeight={fallbackHeight}
    backdropClassName={backdropClassName}
    layerClassName={dropdownClassName}
    layerStyle={dropdownStyle}
    dataAttribute={dataAttribute}
    closeOnEscape={closeOnEscape}
    layerType={layerType}
    resetCursorOnOpen={resetCursorOnOpen}
  >
    {children}
  </FloatingLayerFrame>
);
