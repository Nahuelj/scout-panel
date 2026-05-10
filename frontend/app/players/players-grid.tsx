import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  parsePlayerListSearchParams,
  playersListHrefForState,
  type PlayersListRouteState,
} from '@/lib/player-list-params';
import { getPlayers, getPlayersFilterOptions } from '@/lib/players-api';
import { fetchShortlistPlayerIdsServer } from '@/lib/shortlist-api';
import PlayersGridClient from './players-grid-client';
import PlayersListControls from './players-list-controls';
import PlayersPagination from './players-pagination';
import { BETTER_AUTH_SESSION_COOKIE } from '@/lib/better-auth-session-cookie';

export default async function PlayersGrid({
  routeState,
}: {
  routeState: PlayersListRouteState;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  const initialCanShortlist = Boolean(cookieStore.get(BETTER_AUTH_SESSION_COOKIE)?.value);
  const [filterOptions, listing, initialShortlistIds] = await Promise.all([
    getPlayersFilterOptions(),
    getPlayers(routeState),
    fetchShortlistPlayerIdsServer(cookieHeader),
  ]);
  const { nationalities } = filterOptions;

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
          <PlayersListControls nationalities={nationalities} routeState={syncedRouteState} />
        </div>
      </nav>

      <div className="pt-24 pb-[calc(7.5rem+env(safe-area-inset-bottom))] lg:pt-[110px] sm:pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <PlayersGridClient
          players={listing.data}
          initialShortlistIds={initialShortlistIds}
          initialCanShortlist={initialCanShortlist}
        />
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
