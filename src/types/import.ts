import type { Task } from '$types';

export type ImportStep = 'upload' | 'destination' | 'review';

export interface ParsedTaskWithStatus extends Partial<Task> {
  importStatus?: 'pending' | 'importing' | 'success' | 'error';
  importError?: string;
}
