'use client';

import { useQuery } from '@tanstack/react-query';
import { getPlayersFilterOptions } from '@/features/players/api/players-api';

export const PLAYERS_FILTER_OPTIONS_KEY = ['players', 'filter-options'] as const;

export function usePlayersFilterOptions() {
  return useQuery({
    queryKey: PLAYERS_FILTER_OPTIONS_KEY,
    queryFn: getPlayersFilterOptions,
    staleTime: 5 * 60 * 1000,
  });
}
