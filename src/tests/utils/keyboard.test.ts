import { describe, expect, it } from 'vitest';
import type { KeyboardShortcut } from '$types';
import { getShortcutSignature, shortcutsConflict } from '$utils/keyboard';

const shortcut = (overrides: Partial<KeyboardShortcut>): KeyboardShortcut => ({
  id: 'test-shortcut',
  key: 'n',
  description: 'Test shortcut',
  ...overrides,
});

describe('getShortcutSignature', () => {
  it('normalizes single-character keys case-insensitively', () => {
    expect(getShortcutSignature(shortcut({ key: 'N', meta: true }))).toBe(
      getShortcutSignature(shortcut({ key: 'n', meta: true })),
    );
  });

  it('keeps named keys distinct', () => {
    expect(getShortcutSignature(shortcut({ key: 'ArrowUp' }))).not.toBe(
      getShortcutSignature(shortcut({ key: 'ArrowDown' })),
    );
  });

  it('includes modifiers in the signature', () => {
    expect(getShortcutSignature(shortcut({ key: 'n', meta: true }))).not.toBe(
      getShortcutSignature(shortcut({ key: 'n', shift: true })),
    );
  });
});

describe('shortcutsConflict', () => {
  it('detects duplicate shortcut combinations', () => {
    expect(
      shortcutsConflict(shortcut({ key: 'f', meta: true }), shortcut({ key: 'F', meta: true })),
    ).toBe(true);
  });

  it('allows the same key with different modifiers', () => {
    expect(
      shortcutsConflict(shortcut({ key: 'f', meta: true }), shortcut({ key: 'f', alt: true })),
    ).toBe(false);
  });
});
