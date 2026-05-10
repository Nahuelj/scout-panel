import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  serializePlayersListToPathQuery,
  type PlayersListRouteState,
} from '@/features/players/utils/player-list-params';
import type { PaginationMeta } from '@/features/players/types/player.types';

type Props = {
  routeState: PlayersListRouteState;
  meta: PaginationMeta;
  listPathBase?: string;
  summaryEntityLabel?: string;
  ariaLabel?: string;
};

const activeClass =
  'inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-white/10 px-3 text-sm font-medium text-neutral-200 transition-colors hover:border-white/25 hover:text-white';

const disabledClass =
  'inline-flex min-h-9 cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-white/10 px-3 text-sm font-medium text-neutral-500 opacity-40';

export default function PlayersPagination({
  routeState,
  meta,
  listPathBase = '/players',
  summaryEntityLabel = 'players',
  ariaLabel = 'Players list pagination',
}: Props) {
  const base: PlayersListRouteState = {
    ...routeState,
    page: meta.page,
    pageSize: meta.pageSize,
  };

  const prevHref = `${listPathBase}${serializePlayersListToPathQuery({
    ...base,
    page: meta.page - 1,
  })}`;
  const nextHref = `${listPathBase}${serializePlayersListToPathQuery({
    ...base,
    page: meta.page + 1,
  })}`;

  const summary =
    meta.totalItems === 0
      ? 'No results'
      : `Page ${meta.page} of ${meta.totalPages} · ${meta.totalItems} ${summaryEntityLabel}`;

  return (
    <nav
      aria-label={ariaLabel}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080d14]/95 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:pb-[calc(1rem+env(safe-area-inset-bottom))] md:pt-4"
    >
      <div className="mx-auto flex max-w-screen-xl flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p className="text-sm text-neutral-400">{summary}</p>
        <div className="flex items-center gap-2 sm:justify-end">
          {meta.hasPreviousPage ? (
            <Link href={prevHref} className={activeClass} prefetch={false}>
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </Link>
          ) : (
            <button type="button" disabled className={disabledClass}>
              <ChevronLeft className="size-4" aria-hidden />
              Previous
            </button>
          )}
          {meta.hasNextPage ? (
            <Link href={nextHref} className={activeClass} prefetch={false}>
              Next
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <button type="button" disabled className={disabledClass}>
              Next
              <ChevronRight className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
