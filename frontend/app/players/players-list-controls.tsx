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

type Props = {
  nationalities: string[];
  routeState: PlayersListRouteState;
};

const SEARCH_DEBOUNCE_MS = 380;

const filterLabelClass =
  'block text-xs font-medium leading-tight text-neutral-400 whitespace-nowrap';

const selectFieldClass =
  'h-10 w-full min-w-[9rem] cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#0f1923] pl-3 pr-10 text-sm text-neutral-100 outline-none transition-colors focus:border-white/25 focus:ring-1 focus:ring-white/10';

const optionClass = 'bg-[#0f1923] text-neutral-100';

const ageInputClass =
  'h-10 w-20 rounded-lg border border-white/10 bg-[#0f1923] px-3 text-sm text-neutral-100 outline-none transition-colors focus:border-white/25 focus:ring-1 focus:ring-white/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

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

  const buildNext = useCallback(
    (searchText: string): PlayersListRouteState => ({
      ...(routeState.position ? { position: routeState.position } : {}),
      ...(routeState.nationality ? { nationality: routeState.nationality } : {}),
      ...(routeState.minAge !== undefined ? { minAge: routeState.minAge } : {}),
      ...(routeState.maxAge !== undefined ? { maxAge: routeState.maxAge } : {}),
      ...(searchText.trim() ? { search: searchText.trim() } : {}),
      page: DEFAULT_PLAYERS_PAGE,
      pageSize: PLAYERS_FIXED_PAGE_SIZE,
    }),
    [routeState.position, routeState.nationality, routeState.minAge, routeState.maxAge],
  );

  const commitTrimmedSearch = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      const currentUrl = (routeState.search ?? '').trim();
      if (trimmed === currentUrl) return;
      skipNextUrlSyncRef.current = true;
      onCommitSearch(buildNext(trimmed));
    },
    [onCommitSearch, routeState.search, buildNext],
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

function AgeRangeInputs({
  routeState,
  onCommit,
}: {
  routeState: PlayersListRouteState;
  onCommit: (next: PlayersListRouteState) => void;
}) {
  const [localMin, setLocalMin] = useState(() =>
    routeState.minAge !== undefined ? String(routeState.minAge) : '',
  );
  const [localMax, setLocalMax] = useState(() =>
    routeState.maxAge !== undefined ? String(routeState.maxAge) : '',
  );

  const localMinRef = useRef(localMin);
  const localMaxRef = useRef(localMax);
  const debounceTimerRef = useRef<number | undefined>(undefined);
  const skipMinSyncRef = useRef(false);
  const skipMaxSyncRef = useRef(false);

  useEffect(() => {
    if (skipMinSyncRef.current) {
      skipMinSyncRef.current = false;
      return;
    }
    const next = routeState.minAge !== undefined ? String(routeState.minAge) : '';
    setLocalMin(next);
    localMinRef.current = next;
  }, [routeState.minAge]);

  useEffect(() => {
    if (skipMaxSyncRef.current) {
      skipMaxSyncRef.current = false;
      return;
    }
    const next = routeState.maxAge !== undefined ? String(routeState.maxAge) : '';
    setLocalMax(next);
    localMaxRef.current = next;
  }, [routeState.maxAge]);

  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const routeStateRef = useRef(routeState);
  routeStateRef.current = routeState;

  const scheduleCommit = useCallback(() => {
    if (debounceTimerRef.current !== undefined) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = undefined;
      const minStr = localMinRef.current;
      const maxStr = localMaxRef.current;
      const minAge = minStr !== '' ? parseInt(minStr, 10) : undefined;
      const maxAge = maxStr !== '' ? parseInt(maxStr, 10) : undefined;
      const rs = routeStateRef.current;
      onCommitRef.current({
        ...(rs.search ? { search: rs.search } : {}),
        ...(rs.position ? { position: rs.position } : {}),
        ...(rs.nationality ? { nationality: rs.nationality } : {}),
        ...(minAge !== undefined && Number.isFinite(minAge) && minAge >= 0 ? { minAge } : {}),
        ...(maxAge !== undefined && Number.isFinite(maxAge) && maxAge >= 0 ? { maxAge } : {}),
        page: DEFAULT_PLAYERS_PAGE,
        pageSize: PLAYERS_FIXED_PAGE_SIZE,
      });
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== undefined) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <input
        id="plc-min-age"
        type="number"
        min={0}
        max={99}
        value={localMin}
        onChange={(e) => {
          const val = e.target.value;
          setLocalMin(val);
          localMinRef.current = val;
          skipMinSyncRef.current = true;
          scheduleCommit();
        }}
        placeholder="Min"
        aria-label="Minimum age"
        className={ageInputClass}
      />
      <span className="text-xs text-neutral-500">–</span>
      <input
        id="plc-max-age"
        type="number"
        min={0}
        max={99}
        value={localMax}
        onChange={(e) => {
          const val = e.target.value;
          setLocalMax(val);
          localMaxRef.current = val;
          skipMaxSyncRef.current = true;
          scheduleCommit();
        }}
        placeholder="Max"
        aria-label="Maximum age"
        className={ageInputClass}
      />
    </div>
  );
}

export default function PlayersListControls({ nationalities, routeState }: Props) {
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
    Boolean(routeState.nationality) ||
    routeState.minAge !== undefined ||
    routeState.maxAge !== undefined ||
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
                ...(routeState.nationality ? { nationality: routeState.nationality } : {}),
                ...(routeState.minAge !== undefined ? { minAge: routeState.minAge } : {}),
                ...(routeState.maxAge !== undefined ? { maxAge: routeState.maxAge } : {}),
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
          <label htmlFor="plc-nationality" className={filterLabelClass}>
            Nationality
          </label>
          <FilterSelect
            id="plc-nationality"
            ariaLabel="Filter by nationality"
            value={routeState.nationality ?? ''}
            onChange={(e) => {
              const nationality = e.target.value.trim();
              pushListing({
                ...(routeState.search ? { search: routeState.search } : {}),
                ...(routeState.position ? { position: routeState.position } : {}),
                ...(routeState.minAge !== undefined ? { minAge: routeState.minAge } : {}),
                ...(routeState.maxAge !== undefined ? { maxAge: routeState.maxAge } : {}),
                ...(nationality ? { nationality } : {}),
                page: DEFAULT_PLAYERS_PAGE,
                pageSize: PLAYERS_FIXED_PAGE_SIZE,
              });
            }}
          >
            <option value="" className={optionClass}>
              All nationalities
            </option>
            {nationalities.map((n) => (
              <option key={n} value={n} className={optionClass}>
                {n}
              </option>
            ))}
          </FilterSelect>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="plc-min-age" className={filterLabelClass}>
            Age range
          </label>
          <AgeRangeInputs routeState={routeState} onCommit={pushListing} />
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
