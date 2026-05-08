'use client';

import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search, XCircle } from 'lucide-react';
import {
  DEFAULT_PLAYERS_PAGE,
  PLAYERS_FIXED_PAGE_SIZE,
  PLAYER_POSITION_VALUES,
  playersListHrefForState,
  type PlayersListRouteState,
} from '@/lib/player-list-params';
import type { PlayersListingClubOption } from '@/lib/players-api';

type Props = {
  leagues: string[];
  clubs: PlayersListingClubOption[];
  routeState: PlayersListRouteState;
};

const SEARCH_DEBOUNCE_MS = 380;

const filterLabelClass =
  'block text-xs font-medium leading-tight text-neutral-400 whitespace-nowrap';

const selectFieldClass =
  'h-10 w-full min-w-[9rem] cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#0f1923] pl-3 pr-10 text-sm text-neutral-100 outline-none transition-colors focus:border-white/25 focus:ring-1 focus:ring-white/10';

const optionClass = 'bg-[#0f1923] text-neutral-100';

function buildListingState(
  routeState: Pick<PlayersListRouteState, 'position' | 'league' | 'clubId'>,
  searchText: string,
): PlayersListRouteState {
  const search = searchText.trim();
  return {
    ...(routeState.position ? { position: routeState.position } : {}),
    ...(routeState.league ? { league: routeState.league } : {}),
    ...(routeState.clubId ? { clubId: routeState.clubId } : {}),
    ...(search ? { search } : {}),
    page: DEFAULT_PLAYERS_PAGE,
    pageSize: PLAYERS_FIXED_PAGE_SIZE,
  };
}

function FilterSelect({
  id,
  ariaLabel,
  value,
  onChange,
  children,
}: {
  id: string;
  ariaLabel: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative min-w-[9rem] [color-scheme:dark]">
      <select
        id={id}
        aria-label={ariaLabel}
        value={value}
        className={selectFieldClass}
        onChange={onChange}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 shrink-0 -translate-y-1/2 text-neutral-400"
        aria-hidden
        strokeWidth={2}
      />
    </div>
  );
}

function PlayersDebouncedSearch({
  routeState,
  onCommitSearch,
}: {
  routeState: PlayersListRouteState;
  onCommitSearch: (next: PlayersListRouteState) => void;
}) {
  const [localSearch, setLocalSearch] = useState(() => routeState.search ?? '');
  const debounceTimerRef = useRef<number | undefined>(undefined);
  const skipNextUrlSyncRef = useRef(false);

  useEffect(() => {
    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false;
      return;
    }
    setLocalSearch(routeState.search ?? '');
  }, [routeState.search]);

  const flushTimer = useCallback(() => {
    if (debounceTimerRef.current !== undefined) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = undefined;
    }
  }, []);

  const commitTrimmedSearch = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      const currentUrl = (routeState.search ?? '').trim();
      if (trimmed === currentUrl) return;
      skipNextUrlSyncRef.current = true;
      onCommitSearch(
        buildListingState(
          {
            position: routeState.position,
            league: routeState.league,
            clubId: routeState.clubId,
          },
          trimmed,
        ),
      );
    },
    [onCommitSearch, routeState.search, routeState.position, routeState.league, routeState.clubId],
  );

  useEffect(() => {
    flushTimer();
    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = undefined;
      commitTrimmedSearch(localSearch);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      flushTimer();
    };
  }, [localSearch, commitTrimmedSearch, flushTimer]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    flushTimer();
    commitTrimmedSearch(localSearch);
  };

  return (
    <form className="w-full shrink-0" onSubmit={handleSubmit} noValidate>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
          aria-hidden
        />
        <input
          id="plc-search"
          name="search"
          type="search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search players…"
          autoComplete="off"
          aria-label="Search players by name"
          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20"
        />
      </div>
    </form>
  );
}

export default function PlayersListControls({ leagues, clubs, routeState }: Props) {
  const router = useRouter();

  const pushListing = useCallback(
    (next: PlayersListRouteState) => {
      router.push(playersListHrefForState(next));
    },
    [router],
  );

  const clearedState: PlayersListRouteState = {
    page: DEFAULT_PLAYERS_PAGE,
    pageSize: PLAYERS_FIXED_PAGE_SIZE,
  };
  const clearHref = playersListHrefForState(clearedState);
  const hasActiveFilters =
    Boolean(routeState.search?.trim()) ||
    Boolean(routeState.position) ||
    Boolean(routeState.league) ||
    Boolean(routeState.clubId) ||
    routeState.page !== DEFAULT_PLAYERS_PAGE;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plc-position" className={filterLabelClass}>
            Position
          </label>
          <FilterSelect
            id="plc-position"
            ariaLabel="Filter by position"
            value={routeState.position ?? ''}
            onChange={(e) => {
              const position = e.target.value.trim();
              pushListing({
                ...(routeState.search ? { search: routeState.search } : {}),
                ...(routeState.league ? { league: routeState.league } : {}),
                ...(routeState.clubId ? { clubId: routeState.clubId } : {}),
                ...(position ? { position } : {}),
                page: DEFAULT_PLAYERS_PAGE,
                pageSize: PLAYERS_FIXED_PAGE_SIZE,
              });
            }}
          >
            <option value="" className={optionClass}>
              All positions
            </option>
            {PLAYER_POSITION_VALUES.map((p) => (
              <option key={p} value={p} className={optionClass}>
                {p}
              </option>
            ))}
          </FilterSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plc-league" className={filterLabelClass}>
            League
          </label>
          <FilterSelect
            id="plc-league"
            ariaLabel="Filter by league"
            value={routeState.league ?? ''}
            onChange={(e) => {
              const league = e.target.value.trim();
              pushListing({
                ...(routeState.search ? { search: routeState.search } : {}),
                ...(routeState.position ? { position: routeState.position } : {}),
                ...(routeState.clubId ? { clubId: routeState.clubId } : {}),
                ...(league ? { league } : {}),
                page: DEFAULT_PLAYERS_PAGE,
                pageSize: PLAYERS_FIXED_PAGE_SIZE,
              });
            }}
          >
            <option value="" className={optionClass}>
              All leagues
            </option>
            {leagues.map((name) => (
              <option key={name} value={name} className={optionClass}>
                {name}
              </option>
            ))}
          </FilterSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plc-club" className={filterLabelClass}>
            Club
          </label>
          <FilterSelect
            id="plc-club"
            ariaLabel="Filter by club"
            value={routeState.clubId ?? ''}
            onChange={(e) => {
              const clubId = e.target.value.trim();
              pushListing({
                ...(routeState.search ? { search: routeState.search } : {}),
                ...(routeState.position ? { position: routeState.position } : {}),
                ...(routeState.league ? { league: routeState.league } : {}),
                ...(clubId ? { clubId } : {}),
                page: DEFAULT_PLAYERS_PAGE,
                pageSize: PLAYERS_FIXED_PAGE_SIZE,
              });
            }}
          >
            <option value="" className={optionClass}>
              All clubs
            </option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id} className={optionClass}>
                {c.name}
              </option>
            ))}
          </FilterSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={`${filterLabelClass} invisible`} aria-hidden>
            Clear
          </label>
          {hasActiveFilters ? (
            <Link
              href={clearHref}
              prefetch={false}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 text-sm font-medium text-neutral-200 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
              aria-label="Clear all filters"
            >
              <XCircle className="size-4 shrink-0" aria-hidden strokeWidth={2} />
              Clear filters
            </Link>
          ) : (
            <span className="inline-flex h-10 shrink-0 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm font-medium text-neutral-500 opacity-50">
              <XCircle className="size-4 shrink-0" aria-hidden strokeWidth={2} />
              Clear filters
            </span>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:max-w-sm sm:shrink-0">
        <label htmlFor="plc-search" className={filterLabelClass}>
          Search
        </label>
        <PlayersDebouncedSearch routeState={routeState} onCommitSearch={pushListing} />
      </div>
    </div>
  );
}
