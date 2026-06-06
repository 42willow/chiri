import Monitor from 'lucide-react/icons/monitor';
import Moon from 'lucide-react/icons/moon';
import Sun from 'lucide-react/icons/sun';
import type { Theme } from '$types/color';

/**
 * Theme options for appearance settings
 */
export const THEME_OPTIONS: Array<{
  value: Theme;
  icon: React.ReactNode;
  label: string;
}> = [
  { value: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
  { value: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
  { value: 'system', icon: <Monitor className="h-4 w-4" />, label: 'System' },
];
