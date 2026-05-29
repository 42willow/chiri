/**
 * TanStack Query hooks for saved filters
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys } from '$lib/queryClient';
import { dataStore } from '$lib/store';
import {
  createFilter,
  deleteFilter,
  getAllFilters,
  getFilterById,
  updateFilter,
} from '$lib/store/savedFilters';
import type { Filter } from '$types/filter';

export const useFilters = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    return dataStore.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.filters.all });
    });
  }, [queryClient]);

  return useQuery({
    queryKey: queryKeys.filters.all,
    queryFn: () => getAllFilters(),
    staleTime: Infinity,
  });
};

export const useFilter = (id: string | null) => {
  return useQuery({
    queryKey: id ? queryKeys.filters.byId(id) : [...queryKeys.filters.all, 'empty'],
    queryFn: () => (id ? getFilterById(id) : undefined),
    enabled: id !== null,
    staleTime: Infinity,
  });
};

export const useCreateFilter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filter: Partial<Filter>) => {
      return Promise.resolve(createFilter(filter));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.filters.all });
      queryClient.invalidateQueries({ queryKey: ['filteredTasks'] });
    },
  });
};

export const useUpdateFilter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Filter> }) => {
      return Promise.resolve(updateFilter(id, updates));
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.filters.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.filters.byId(id) });
      queryClient.invalidateQueries({ queryKey: ['filteredTasks'] });
    },
  });
};

export const useDeleteFilter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      deleteFilter(id);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.filters.all });
      queryClient.invalidateQueries({ queryKey: ['uiState'] });
      queryClient.invalidateQueries({ queryKey: ['filteredTasks'] });
    },
  });
};
