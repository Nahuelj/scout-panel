'use client';

import type { ChangeEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Search } from 'lucide-react';
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

const selectFieldClass =
  'h-10 w-full min-w-[9rem] cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#0f1923] pl-3 pr-10 text-sm text-neutral-100 outline-none transition-colors focus:border-white/25 focus:ring-1 focus:ring-white/10';

const optionClass = 'bg-[#0f1923] text-neutral-100';

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

export default function PlayersListControls({ leagues, clubs, routeState }: Props) {
  const router = useRouter();

  function pushListing(next: PlayersListRouteState) {
    router.push(playersListHrefForState(next));
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plc-position" className="text-xs font-medium text-neutral-400">
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
          <label htmlFor="plc-league" className="text-xs font-medium text-neutral-400">
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
          <label htmlFor="plc-club" className="text-xs font-medium text-neutral-400">
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
      </div>

      <form
        className="w-full sm:max-w-sm sm:shrink-0 sm:self-end"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const raw = String(fd.get('search') ?? '').trim();
          pushListing({
            ...(routeState.position ? { position: routeState.position } : {}),
            ...(routeState.league ? { league: routeState.league } : {}),
            ...(routeState.clubId ? { clubId: routeState.clubId } : {}),
            ...(raw ? { search: raw } : {}),
            page: DEFAULT_PLAYERS_PAGE,
            pageSize: PLAYERS_FIXED_PAGE_SIZE,
          });
        }}
      >
        <label htmlFor="plc-search" className="sr-only">
          Search players
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
            aria-hidden
          />
          <input
            id="plc-search"
            name="search"
            type="search"
            defaultValue={routeState.search ?? ''}
            placeholder="Search players…"
            autoComplete="off"
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20"
          />
        </div>
      </form>
    </div>
  );
}
