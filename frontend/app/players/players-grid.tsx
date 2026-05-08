import { redirect } from 'next/navigation';
import {
  parsePlayerListSearchParams,
  playersListHrefForState,
  type PlayersListRouteState,
} from '@/lib/player-list-params';
import { getPlayers, getPlayersFilterOptions } from '@/lib/players-api';
import PlayersGridClient from './players-grid-client';
import PlayersListControls from './players-list-controls';
import PlayersPagination from './players-pagination';

export default async function PlayersGrid({
  routeState,
}: {
  routeState: PlayersListRouteState;
}) {
  const [filterOptions, listing] = await Promise.all([
    getPlayersFilterOptions(),
    getPlayers(routeState),
  ]);
  const leagues = filterOptions.leagues;
  const clubs = filterOptions.clubs;

  const { meta } = listing;
  if (
    meta.page !== routeState.page ||
    meta.pageSize !== routeState.pageSize
  ) {
    redirect(
      playersListHrefForState({
        ...routeState,
        page: meta.page,
        pageSize: meta.pageSize,
      }),
    );
  }

  const syncedRouteState: PlayersListRouteState = {
    ...routeState,
    page: meta.page,
    pageSize: meta.pageSize,
  };

  return (
    <>
      <nav
        aria-label="Players list filters"
        className="fixed inset-x-0 top-[var(--app-header-h)] z-[45] border-b border-white/10 bg-[#080d14]/95 py-4 backdrop-blur-md"
      >
        <div className="mx-auto max-w-screen-xl px-6 md:px-8">
          <PlayersListControls leagues={leagues} clubs={clubs} routeState={syncedRouteState} />
        </div>
      </nav>

      <div className="pb-0 pt-[110px]">
        <PlayersGridClient players={listing.data} />
      </div>
      <PlayersPagination routeState={syncedRouteState} meta={listing.meta} />
    </>
  );
}

export async function PlayersGridFromSearchParams({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const routeState = parsePlayerListSearchParams(sp);
  return <PlayersGrid routeState={routeState} />;
}
