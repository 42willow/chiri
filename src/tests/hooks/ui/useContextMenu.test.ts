import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FloatingLayerFrame } from '$components/FloatingLayerFrame';

interface ProbeProps {
  height: number;
  x: number;
  y: number;
}

const Probe = ({ height, x, y }: ProbeProps) =>
  createElement(
    FloatingLayerFrame,
    {
      anchor: { type: 'point', x, y },
      dataAttribute: 'data-test-floating-layer',
      layerType: 'context-menu',
      onClose: vi.fn(),
    },
    createElement('div', {
      'data-height': String(height),
      'data-width': '200',
    }),
  );

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
};

const getMeasuredSize = (element: HTMLElement, attributeName: string) => {
  const ownValue = element.getAttribute(attributeName);
  if (ownValue) return Number(ownValue);

  const childValue = element.firstElementChild?.getAttribute(attributeName);
  return Number(childValue ?? 0);
};

const installMeasuredSizeGetters = () => {
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get() {
      return getMeasuredSize(this, 'data-width');
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get() {
      return getMeasuredSize(this, 'data-height');
    },
  });
};

const getLayer = () => document.querySelector('[data-test-floating-layer]') as HTMLElement;

describe('FloatingLayerFrame point positioning', () => {
  let container: HTMLDivElement;
  let originalOffsetHeight: PropertyDescriptor | undefined;
  let originalOffsetWidth: PropertyDescriptor | undefined;
  let root: Root;

  beforeEach(() => {
    (
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    setViewport(800, 500);
    originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
    originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    installMeasuredSizeGetters();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    if (originalOffsetHeight) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, 'offsetHeight');
    }
    if (originalOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, 'offsetWidth');
    }
  });

  it('keeps the opening position stable across unrelated rerenders', () => {
    act(() => {
      root.render(createElement(Probe, { height: 100, x: 100, y: 100 }));
    });

    expect(getLayer().style.top).toBe('104px');

    act(() => {
      root.render(createElement(Probe, { height: 480, x: 100, y: 100 }));
    });

    expect(getLayer().style.top).toBe('104px');
  });

  it('repositions when the opening point changes', () => {
    act(() => {
      root.render(createElement(Probe, { height: 100, x: 100, y: 100 }));
    });

    act(() => {
      root.render(createElement(Probe, { height: 480, x: 100, y: 460 }));
    });

    expect(getLayer().style.top).toBe('8px');
  });
});
