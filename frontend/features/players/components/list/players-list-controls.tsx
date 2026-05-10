'use client';

import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ListFilter, Search, XCircle } from 'lucide-react';
import { Dialog } from 'radix-ui';
import {
  DEFAULT_PLAYERS_PAGE,
  PLAYERS_FIXED_PAGE_SIZE,
  PLAYER_POSITION_VALUES,
  serializePlayersListToPathQuery,
  type PlayersListRouteState,
} from '@/features/players/utils/player-list-params';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  nationalities: string[];
  routeState: PlayersListRouteState;
  listPathBase?: string;
  searchPlaceholder?: string;
};

const LG_MIN_QUERY = '(min-width: 1024px)';

function useLgUp(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(LG_MIN_QUERY);
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(LG_MIN_QUERY).matches,
    () => false,
  );
}

function countActiveFilterGroups(state: PlayersListRouteState): number {
  let n = 0;
  if (state.search?.trim()) n += 1;
  if (state.position) n += 1;
  if (state.nationality) n += 1;
  if (state.minAge !== undefined || state.maxAge !== undefined) n += 1;
  return n;
}

const SEARCH_DEBOUNCE_MS = 380;

const filterLabelClass =
  'block text-xs font-medium leading-tight text-neutral-400 whitespace-nowrap';

const selectFieldClass =
  'h-10 w-full min-w-[9rem] cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#0f1923] pl-3 pr-10 text-sm text-neutral-100 outline-none transition-colors focus:border-white/25 focus:ring-1 focus:ring-white/10';

const selectFieldDrawerClass =
  'h-10 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#0f1923] pl-3 pr-10 text-sm text-neutral-100 outline-none transition-colors focus:border-white/25 focus:ring-1 focus:ring-white/10';

const optionClass = 'bg-[#0f1923] text-neutral-100';

const ageInputClass =
  'h-10 w-20 rounded-lg border border-white/10 bg-[#0f1923] px-3 text-sm text-neutral-100 outline-none transition-colors focus:border-white/25 focus:ring-1 focus:ring-white/10 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

function FilterSelect({
  id,
  ariaLabel,
  value,
  onChange,
  variant,
  children,
}: {
  id: string;
  ariaLabel: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  variant?: 'toolbar' | 'drawer';
  children: ReactNode;
}) {
  const isDrawer = variant === 'drawer';
  return (
    <div className={cn('relative [color-scheme:dark]', isDrawer ? 'w-full min-w-0' : 'min-w-[9rem]')}>
      <select
        id={id}
        aria-label={ariaLabel}
        value={value}
        className={isDrawer ? selectFieldDrawerClass : selectFieldClass}
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
  searchPlaceholder,
  searchInputId,
}: {
  routeState: PlayersListRouteState;
  onCommitSearch: (next: PlayersListRouteState) => void;
  searchPlaceholder: string;
  searchInputId: string;
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
          id={searchInputId}
          name="search"
          type="search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={searchPlaceholder}
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
  minId,
  maxId,
}: {
  routeState: PlayersListRouteState;
  onCommit: (next: PlayersListRouteState) => void;
  minId: string;
  maxId: string;
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
  const routeStateRef = useRef(routeState);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    routeStateRef.current = routeState;
  }, [routeState]);

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
        id={minId}
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
        id={maxId}
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

type FilterFieldsProps = {
  nationalities: string[];
  routeState: PlayersListRouteState;
  pushListing: (next: PlayersListRouteState) => void;
  clearHref: string;
  hasActiveFilters: boolean;
  variant: 'toolbar' | 'drawer';
  positionId: string;
  nationalityId: string;
  minAgeId: string;
  maxAgeId: string;
};

function PlayersListFilterFields({
  nationalities,
  routeState,
  pushListing,
  clearHref,
  hasActiveFilters,
  variant,
  positionId,
  nationalityId,
  minAgeId,
  maxAgeId,
}: FilterFieldsProps) {
  const wrapClass = variant === 'toolbar' ? 'flex flex-wrap items-end gap-x-4 gap-y-3' : 'flex flex-col gap-4';

  return (
    <div className={wrapClass}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={positionId} className={filterLabelClass}>
          Position
        </label>
        <FilterSelect
          id={positionId}
          ariaLabel="Filter by position"
          value={routeState.position ?? ''}
          variant={variant}
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
        <label htmlFor={nationalityId} className={filterLabelClass}>
          Nationality
        </label>
        <FilterSelect
          id={nationalityId}
          ariaLabel="Filter by nationality"
          value={routeState.nationality ?? ''}
          variant={variant}
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
        <label htmlFor={minAgeId} className={filterLabelClass}>
          Age range
        </label>
        <AgeRangeInputs
          routeState={routeState}
          onCommit={pushListing}
          minId={minAgeId}
          maxId={maxAgeId}
        />
      </div>

      {variant === 'toolbar' ? (
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
      ) : null}
    </div>
  );
}

function PlayersListControlsDesktop({
  nationalities,
  routeState,
  searchPlaceholder,
  pushListing,
  clearHref,
  hasActiveFilters,
}: {
  nationalities: string[];
  routeState: PlayersListRouteState;
  searchPlaceholder: string;
  pushListing: (next: PlayersListRouteState) => void;
  clearHref: string;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <PlayersListFilterFields
        nationalities={nationalities}
        routeState={routeState}
        pushListing={pushListing}
        clearHref={clearHref}
        hasActiveFilters={hasActiveFilters}
        variant="toolbar"
        positionId="plc-position"
        nationalityId="plc-nationality"
        minAgeId="plc-min-age"
        maxAgeId="plc-max-age"
      />

      <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:max-w-sm sm:shrink-0">
        <label htmlFor="plc-search" className={filterLabelClass}>
          Search
        </label>
        <PlayersDebouncedSearch
          routeState={routeState}
          onCommitSearch={pushListing}
          searchPlaceholder={searchPlaceholder}
          searchInputId="plc-search"
        />
      </div>
    </div>
  );
}

function PlayersListControlsCompact({
  nationalities,
  routeState,
  searchPlaceholder,
  pushListing,
  clearHref,
  hasActiveFilters,
  activeFilterCount,
}: {
  nationalities: string[];
  routeState: PlayersListRouteState;
  searchPlaceholder: string;
  pushListing: (next: PlayersListRouteState) => void;
  clearHref: string;
  hasActiveFilters: boolean;
  activeFilterCount: number;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1 flex flex-col gap-1.5">
          <label htmlFor="plc-search-compact" className={filterLabelClass}>
            Search
          </label>
          <PlayersDebouncedSearch
            routeState={routeState}
            onCommitSearch={pushListing}
            searchPlaceholder={searchPlaceholder}
            searchInputId="plc-search-compact"
          />
        </div>

        <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Dialog.Trigger asChild>
            <Button
              type="button"
              variant="outline"
              className="relative h-10 shrink-0 gap-2 border-white/15 bg-white/[0.06] px-3 pr-3.5 text-neutral-200 hover:bg-white/10 hover:text-white dark:border-white/15 dark:bg-white/[0.06] dark:hover:bg-white/10"
              aria-label={
                activeFilterCount > 0
                  ? `Open filters, ${activeFilterCount} active`
                  : 'Open filters'
              }
            >
              <ListFilter className="size-4" strokeWidth={2} aria-hidden />
              <span>Filters</span>
              {activeFilterCount > 0 ? (
                <span
                  className="pointer-events-none absolute -right-1 -top-1 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full border-2 border-[#080d14] bg-emerald-500 px-1 text-[10px] font-bold tabular-nums leading-none text-[#080d14]"
                  aria-hidden
                >
                  {activeFilterCount > 9 ? '9+' : activeFilterCount}
                </span>
              ) : null}
            </Button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
              aria-hidden
            />
            <Dialog.Content className="fixed inset-x-0 bottom-0 z-[60] flex max-h-[85dvh] flex-col rounded-t-2xl border border-white/10 border-b-0 bg-[#080d14] shadow-2xl outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2">
              <div className="flex min-h-0 flex-1 flex-col px-6 pt-6">
                <Dialog.Title className="mb-4 shrink-0 text-base font-semibold text-white">
                  Filters
                </Dialog.Title>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
                  <PlayersListFilterFields
                    nationalities={nationalities}
                    routeState={routeState}
                    pushListing={pushListing}
                    clearHref={clearHref}
                    hasActiveFilters={hasActiveFilters}
                    variant="drawer"
                    positionId="plc-drawer-position"
                    nationalityId="plc-drawer-nationality"
                    minAgeId="plc-drawer-min-age"
                    maxAgeId="plc-drawer-max-age"
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
                <Button
                  type="button"
                  className="h-10 shrink-0 bg-emerald-600 px-4 text-white hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  onClick={() => setDrawerOpen(false)}
                >
                  Confirm
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}

export default function PlayersListControls({
  nationalities,
  routeState,
  listPathBase = '/players',
  searchPlaceholder = 'Search players…',
}: Props) {
  const router = useRouter();
  const isLgUp = useLgUp();
  const listHrefForState = useMemo(
    () => (state: PlayersListRouteState) =>
      `${listPathBase}${serializePlayersListToPathQuery(state)}`,
    [listPathBase],
  );

  const pushListing = useCallback(
    (next: PlayersListRouteState) => {
      router.push(listHrefForState(next));
    },
    [router, listHrefForState],
  );

  const clearedState: PlayersListRouteState = {
    page: DEFAULT_PLAYERS_PAGE,
    pageSize: PLAYERS_FIXED_PAGE_SIZE,
  };
  const clearHref = listHrefForState(clearedState);
  const hasActiveFilters =
    Boolean(routeState.search?.trim()) ||
    Boolean(routeState.position) ||
    Boolean(routeState.nationality) ||
    routeState.minAge !== undefined ||
    routeState.maxAge !== undefined ||
    routeState.page !== DEFAULT_PLAYERS_PAGE;

  const activeFilterCount = countActiveFilterGroups(routeState);

  const shared = {
    nationalities,
    routeState,
    searchPlaceholder,
    pushListing,
    clearHref,
    hasActiveFilters,
  };

  return isLgUp ? (
    <PlayersListControlsDesktop {...shared} />
  ) : (
    <PlayersListControlsCompact {...shared} activeFilterCount={activeFilterCount} />
  );
}
