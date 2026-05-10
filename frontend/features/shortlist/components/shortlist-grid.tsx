import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  parsePlayerListSearchParams,
  serializePlayersListToPathQuery,
  shortlistListHrefForState,
  type PlayersListRouteState,
} from '@/features/players/utils/player-list-params';
import { getPlayersFilterOptions } from '@/features/players/api/players-api';
import { fetchShortlistServer } from '@/features/shortlist/api/shortlist-api';
import { PlayersListControls, PlayersPagination } from '@/features/players';
import ShortlistGridClient from './shortlist-grid-client';
import { BETTER_AUTH_SESSION_COOKIE } from '@/features/auth/lib/session-cookie';

export default async function ShortlistGrid({
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

  const [filterOptions, listing] = await Promise.all([
    getPlayersFilterOptions(),
    fetchShortlistServer(cookieHeader, routeState),
  ]);

  if (listing === null) {
    const path = `/players/shortlist${serializePlayersListToPathQuery(routeState)}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(path)}`);
  }

  const { nationalities } = filterOptions;
  const { meta } = listing;
  if (
    meta.page !== routeState.page ||
    meta.pageSize !== routeState.pageSize
  ) {
    redirect(
      shortlistListHrefForState({
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
        aria-label="Shortlist filters"
        className="fixed inset-x-0 top-[var(--app-header-h)] z-[45] border-b border-cyan-500/20 bg-[#080d14]/95 py-4 backdrop-blur-md"
      >
        <div className="mx-auto max-w-screen-xl px-6 md:px-8">
          <PlayersListControls
            nationalities={nationalities}
            routeState={syncedRouteState}
            listPathBase="/players/shortlist"
            searchPlaceholder="Search shortlist…"
          />
        </div>
      </nav>

      <div className="pt-[110px] pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <ShortlistGridClient players={listing.data} initialCanShortlist={initialCanShortlist} />
      </div>
      <PlayersPagination
        routeState={syncedRouteState}
        meta={listing.meta}
        listPathBase="/players/shortlist"
        summaryEntityLabel="shortlisted players"
        ariaLabel="Shortlist pagination"
      />
    </>
  );
}

export async function ShortlistGridFromSearchParams({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const routeState = parsePlayerListSearchParams(sp);
  return <ShortlistGrid routeState={routeState} />;
}
