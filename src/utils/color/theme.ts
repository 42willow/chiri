import type { ColorSchemeMode, Theme } from '$types/color';

const prefersDarkQuery = window.matchMedia('(prefers-color-scheme: dark)').matches;

/**
 * apply the theme to the document
 */
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  if (theme === 'system') {
    root.classList.toggle('dark', prefersDarkQuery);
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
};

/**
 * resolve the effective theme (light or dark), accounting for system preference
 */
export const resolveEffectiveTheme = (theme: Theme): ColorSchemeMode => {
  if (theme === 'system') {
    return prefersDarkQuery ? 'dark' : 'light';
  }
  return theme;
};
