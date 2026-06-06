import type { ReactNode } from 'react';

interface AboutSettingsSectionProps {
  title: string;
  children: ReactNode;
}

export const AboutSettingsSection = ({ title, children }: AboutSettingsSectionProps) => (
  <div className="space-y-2">
    <p className="px-1 font-semibold text-surface-400 text-xs uppercase tracking-wider dark:text-surface-500">
      {title}
    </p>
    <div className="divide-y divide-surface-100 overflow-hidden rounded-lg border border-surface-200 bg-white dark:divide-surface-700 dark:border-surface-700 dark:bg-surface-800">
      {children}
    </div>
  </div>
);
