import type { Priority, TaskStatus } from '$types';

export type FilterCombinator = 'all' | 'any';

export type DateFilterField = 'dueDate' | 'startDate' | 'createdAt' | 'modifiedAt' | 'completedAt';
export type DateFilterOp = 'exists' | 'empty' | 'today' | 'tomorrow' | 'beforeToday' | 'withinDays';

export type FilterCriterion =
  | {
      field: DateFilterField;
      op: DateFilterOp;
      value?: number;
    }
  | {
      field: 'status';
      op: 'is' | 'isNot' | 'in' | 'notIn';
      value: TaskStatus | TaskStatus[];
    }
  | {
      field: 'priority';
      op: 'is' | 'isNot' | 'in' | 'notIn';
      value: Priority | Priority[];
    }
  | {
      field: 'tags';
      op: 'has' | 'hasAny' | 'hasAll' | 'empty';
      value?: string[];
    }
  | {
      field: 'calendar';
      op: 'is' | 'isAnyOf';
      value: string[];
    }
  | {
      field: 'text';
      op: 'contains';
      value: string;
    };

export interface Filter {
  id: string;
  presetId?: string;
  name: string;
  icon?: string;
  emoji?: string;
  color?: string;
  combinator: FilterCombinator;
  criteria: FilterCriterion[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
