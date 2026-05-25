import { DEFAULT_CALENDAR_NAME } from '$constants';
import type { Account, Calendar, Task } from '$types';

interface ShouldShowOnboardingInput {
  onboardingCompleted: boolean;
  accountsPending: boolean;
  tasksPending: boolean;
  accounts: Account[];
  tasks: Task[];
}

const isGeneratedLocalCalendar = (calendar: Calendar) =>
  calendar.displayName === DEFAULT_CALENDAR_NAME && calendar.url.startsWith('local://');

const hasOnlyGeneratedLocalAccount = (accounts: Account[], tasks: Task[]) => {
  if (accounts.length !== 1 || tasks.length > 0) return false;

  const [account] = accounts;
  if (!account || account.caldav || account.name !== 'Local' || account.calendars.length !== 1) {
    return false;
  }

  return isGeneratedLocalCalendar(account.calendars[0]);
};

export const shouldShowOnboarding = ({
  onboardingCompleted,
  accountsPending,
  tasksPending,
  accounts,
  tasks,
}: ShouldShowOnboardingInput) => {
  if (onboardingCompleted || accountsPending || tasksPending) return false;
  if (accounts.length === 0) return true;

  return hasOnlyGeneratedLocalAccount(accounts, tasks);
};
