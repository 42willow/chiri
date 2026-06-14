import { useCallback, useMemo } from 'react';
import { useAccounts } from '$hooks/queries/useAccounts';
import { useFilters } from '$hooks/queries/useFilters';
import { useTags } from '$hooks/queries/useTags';
import {
  useSetActiveAccount,
  useSetActiveCalendar,
  useSetActiveFilter,
  useSetActiveTag,
  useSetAllTasksView,
  useSetRecentlyDeletedView,
  useUIState,
} from '$hooks/queries/useUIState';

type ListItem =
  | { type: 'all' }
  | { type: 'recently-deleted' }
  | { type: 'filter'; filterId: string }
  | { type: 'calendar'; accountId: string; calendarId: string }
  | { type: 'tag'; tagId: string };

export const useListNavigationCommands = () => {
  const { data: accounts = [] } = useAccounts();
  const { data: tags = [] } = useTags();
  const { data: filters = [] } = useFilters();
  const { data: uiState } = useUIState();
  const setActiveAccountMutation = useSetActiveAccount();
  const setActiveCalendarMutation = useSetActiveCalendar();
  const setActiveTagMutation = useSetActiveTag();
  const setActiveFilterMutation = useSetActiveFilter();
  const setAllTasksViewMutation = useSetAllTasksView();
  const setRecentlyDeletedViewMutation = useSetRecentlyDeletedView();

  const orderedLists = useMemo((): ListItem[] => {
    const items: ListItem[] = [{ type: 'all' }, { type: 'recently-deleted' }];

    for (const filter of filters) {
      items.push({ type: 'filter', filterId: filter.id });
    }

    for (const account of accounts) {
      for (const cal of account.calendars) {
        items.push({ type: 'calendar', accountId: account.id, calendarId: cal.id });
      }
    }

    for (const tag of tags) {
      items.push({ type: 'tag', tagId: tag.id });
    }

    return items;
  }, [accounts, filters, tags]);

  const activeCalendarId = uiState?.activeCalendarId ?? null;
  const activeTagId = uiState?.activeTagId ?? null;
  const activeFilterId = uiState?.activeFilterId ?? null;
  const activeView = uiState?.activeView ?? 'tasks';

  const currentListIndex = useMemo(() => {
    if (activeView === 'recently-deleted') {
      return orderedLists.findIndex((item) => item.type === 'recently-deleted');
    }

    if (activeView === 'filter' && activeFilterId !== null) {
      return orderedLists.findIndex(
        (item) => item.type === 'filter' && item.filterId === activeFilterId,
      );
    }

    if (activeTagId !== null) {
      return orderedLists.findIndex((item) => item.type === 'tag' && item.tagId === activeTagId);
    }

    if (activeCalendarId !== null) {
      return orderedLists.findIndex(
        (item) => item.type === 'calendar' && item.calendarId === activeCalendarId,
      );
    }

    return 0;
  }, [orderedLists, activeCalendarId, activeFilterId, activeTagId, activeView]);

  const activateListItem = useCallback(
    (item: ListItem) => {
      if (item.type === 'all') {
        setAllTasksViewMutation.mutate();
        setActiveAccountMutation.mutate(null);
      } else if (item.type === 'calendar') {
        setActiveAccountMutation.mutate(item.accountId);
        setActiveCalendarMutation.mutate(item.calendarId);
      } else if (item.type === 'tag') {
        setActiveTagMutation.mutate(item.tagId);
      } else if (item.type === 'filter') {
        setActiveFilterMutation.mutate(item.filterId);
      } else {
        setRecentlyDeletedViewMutation.mutate();
      }
    },
    [
      setAllTasksViewMutation,
      setActiveAccountMutation,
      setActiveCalendarMutation,
      setActiveFilterMutation,
      setActiveTagMutation,
      setRecentlyDeletedViewMutation,
    ],
  );

  const navPrevList = useCallback(() => {
    const prevIndex = Math.max(0, currentListIndex - 1);
    if (prevIndex !== currentListIndex) activateListItem(orderedLists[prevIndex]);
  }, [orderedLists, currentListIndex, activateListItem]);

  const navNextList = useCallback(() => {
    const nextIndex = Math.min(orderedLists.length - 1, currentListIndex + 1);
    if (nextIndex !== currentListIndex) activateListItem(orderedLists[nextIndex]);
  }, [orderedLists, currentListIndex, activateListItem]);

  return {
    navPrevList,
    navNextList,
  };
};
