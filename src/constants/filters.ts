import type { Filter } from '$types';

export type FilterPresetDefinition = Pick<
  Filter,
  'name' | 'icon' | 'combinator' | 'criteria' | 'sortOrder'
>;

export const DEFAULT_FILTER_PRESET_DEFINITIONS: FilterPresetDefinition[] = [
  {
    name: 'Today',
    icon: 'calendar-check',
    combinator: 'all',
    sortOrder: 100,
    criteria: [
      { field: 'dueDate', op: 'today' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
  },
  {
    name: 'Overdue',
    icon: 'clock',
    combinator: 'all',
    sortOrder: 200,
    criteria: [
      { field: 'dueDate', op: 'beforeToday' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
  },
  {
    name: 'Scheduled',
    icon: 'calendar-clock',
    combinator: 'all',
    sortOrder: 300,
    criteria: [
      { field: 'dueDate', op: 'exists' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
  },
  {
    name: 'This Week',
    icon: 'calendar-days',
    combinator: 'all',
    sortOrder: 400,
    criteria: [
      { field: 'dueDate', op: 'withinDays', value: 7 },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
  },
  {
    name: 'Recently Modified',
    icon: 'sparkles',
    combinator: 'all',
    sortOrder: 500,
    criteria: [{ field: 'modifiedAt', op: 'withinDays', value: 7 }],
  },
];

export const FILTER_PRESET_DEFINITIONS: FilterPresetDefinition[] = [
  ...DEFAULT_FILTER_PRESET_DEFINITIONS,
  {
    name: 'Tomorrow',
    icon: 'calendar',
    combinator: 'all',
    sortOrder: 600,
    criteria: [
      { field: 'dueDate', op: 'tomorrow' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
  },
  {
    name: 'No Due Date',
    icon: 'list-todo',
    combinator: 'all',
    sortOrder: 700,
    criteria: [
      { field: 'dueDate', op: 'empty' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
  },
  {
    name: 'High Priority',
    icon: 'flag',
    combinator: 'all',
    sortOrder: 800,
    criteria: [
      { field: 'priority', op: 'is', value: 'high' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
  },
  {
    name: 'Untagged',
    icon: 'tag',
    combinator: 'all',
    sortOrder: 900,
    criteria: [
      { field: 'tags', op: 'empty' },
      { field: 'status', op: 'notIn', value: ['completed', 'cancelled'] },
    ],
  },
  {
    name: 'Recently Completed',
    icon: 'check-square',
    combinator: 'all',
    sortOrder: 1000,
    criteria: [
      { field: 'completedAt', op: 'withinDays', value: 7 },
      { field: 'status', op: 'is', value: 'completed' },
    ],
  },
];

export const DEFAULT_FILTER_DEFINITIONS: Array<FilterPresetDefinition & Pick<Filter, 'id'>> =
  DEFAULT_FILTER_PRESET_DEFINITIONS.map((filter, index) => ({
    ...filter,
    id: `default-filter-${filter.name.toLowerCase().replace(/\s+/g, '-')}`,
    sortOrder: (index + 1) * 100,
  }));
