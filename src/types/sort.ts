export type SortMode =
  | 'manual' // uses x-apple-sort-order
  | 'smart' // smart sort using x-apple-sort-order
  | 'due-date'
  | 'start-date'
  | 'priority'
  | 'title'
  | 'modified'
  | 'created';
export type SortDirection = 'asc' | 'desc';
export interface SortConfig {
  mode: SortMode;
  direction: SortDirection;
}

export type AccountSortMode = 'manual' | 'title';
export interface AccountSortConfig {
  mode: AccountSortMode;
  direction: SortDirection;
}

export type CalendarSortMode = 'manual' | 'server' | 'title';
export interface CalendarSortConfig {
  mode: CalendarSortMode;
  direction: SortDirection;
}

export type TagSortMode = 'manual' | 'title';
export interface TagSortConfig {
  mode: TagSortMode;
  direction: SortDirection;
}
