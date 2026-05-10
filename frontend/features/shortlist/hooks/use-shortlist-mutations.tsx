'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Bookmark, BookmarkX } from 'lucide-react';
import {
  addToShortlist,
  removeFromShortlist,
} from '@/features/shortlist/api/shortlist-api';
import { ROUTES } from '@/lib/constants';
import { SHORTLIST_IDS_KEY } from './use-shortlist-ids';

export function useAddToShortlist() {
  const queryClient = useQueryClient();
  const router = useRouter();
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
    onSuccess: () => {
      toast('Added to shortlist', {
        icon: <Bookmark className="size-4 fill-sky-400/40 text-sky-300" strokeWidth={1.75} />,
        action: {
          label: 'View shortlist',
          onClick: () => router.push(ROUTES.shortlist),
        },
      });
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
    onSuccess: () => {
      toast('Removed from shortlist', {
        icon: <BookmarkX className="size-4 text-sky-300" strokeWidth={1.75} />,
      });
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
