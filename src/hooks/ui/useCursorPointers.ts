import { useEffect } from 'react';
import { useSettingsStore } from '$context/settingsContext';

const POINTER_CLASS = 'chiri-pointer-cursors';
const STANDARD_CLASS = 'chiri-standard-cursors';

export const useCursorPointers = () => {
  const { showCursorPointers } = useSettingsStore();

  useEffect(() => {
    document.documentElement.classList.toggle(POINTER_CLASS, showCursorPointers);
    document.documentElement.classList.toggle(STANDARD_CLASS, !showCursorPointers);

    return () => {
      document.documentElement.classList.remove(POINTER_CLASS, STANDARD_CLASS);
    };
  }, [showCursorPointers]);
};
