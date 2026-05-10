'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchShortlistPlayerIds } from '@/features/shortlist/api/shortlist-api';

export const SHORTLIST_IDS_KEY = ['shortlist', 'ids'] as const;

export function useShortlistIds(options?: {
  enabled?: boolean;
  initialData?: string[];
}) {
  return useQuery({
    queryKey: SHORTLIST_IDS_KEY,
    queryFn: ({ signal }) => fetchShortlistPlayerIds({ signal }),
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
    staleTime: 30_000,
  });
}
