'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addToShortlist,
  removeFromShortlist,
} from '@/features/shortlist/api/shortlist-api';
import { SHORTLIST_IDS_KEY } from './use-shortlist-ids';

export function useAddToShortlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['shortlist', 'add'],
    mutationFn: addToShortlist,
    onMutate: async (playerId: string) => {
      await queryClient.cancelQueries({ queryKey: SHORTLIST_IDS_KEY });
      const previous = queryClient.getQueryData<string[]>(SHORTLIST_IDS_KEY);
      queryClient.setQueryData<string[]>(SHORTLIST_IDS_KEY, (old) => {
        const list = old ?? [];
        return list.includes(playerId) ? list : [...list, playerId];
      });
      return { previous };
    },
    onError: (_err, _playerId, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(SHORTLIST_IDS_KEY, ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SHORTLIST_IDS_KEY });
    },
  });
}

export function useRemoveFromShortlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['shortlist', 'remove'],
    mutationFn: removeFromShortlist,
    onMutate: async (playerId: string) => {
      await queryClient.cancelQueries({ queryKey: SHORTLIST_IDS_KEY });
      const previous = queryClient.getQueryData<string[]>(SHORTLIST_IDS_KEY);
      queryClient.setQueryData<string[]>(SHORTLIST_IDS_KEY, (old) => {
        return (old ?? []).filter((id) => id !== playerId);
      });
      return { previous };
    },
    onError: (_err, _playerId, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(SHORTLIST_IDS_KEY, ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SHORTLIST_IDS_KEY });
    },
  });
}
