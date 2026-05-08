import {
  DEFAULT_PLAYERS_PAGE,
  PLAYERS_FIXED_PAGE_SIZE,
  type PlayersListRouteState,
} from './player-list-params';

export type PlayerCardData = {
  id: string;
  name: string;
  photoUrl: string | null;
  position: string;
  nationality: string | null;
  birthDate: string | null;
  currentSeason: {
    club: string;
    clubLogoUrl: string | null;
    league: string | null;
    stats: {
      matchesPlayed: number;
      goals: number;
      assists: number;
      xGPer90: number | null;
    } | null;
  } | null;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedPlayersResponse = {
  data: PlayerCardData[];
  meta: PaginationMeta;
};

export type PlayersFilterOptions = {
  nationalities: string[];
};

function playersApiOrigin(): string {
  const configured =
    typeof process.env.NEXT_PUBLIC_API_URL === 'string'
      ? process.env.NEXT_PUBLIC_API_URL.trim()
      : '';

  if (configured.length > 0) {
    return configured.replace(/\/$/, '');
  }

  return typeof window === 'undefined'
    ? 'http://127.0.0.1:8080'
    : 'http://localhost:8080';
}

function serializeApiQuery(state: PlayersListRouteState): URLSearchParams {
  const entries: Record<string, string | number | undefined> = {
    ...(state.search && { search: state.search }),
    ...(state.position && { position: state.position }),
    ...(state.nationality && { nationality: state.nationality }),
    ...(state.minAge !== undefined && { minAge: state.minAge }),
    ...(state.maxAge !== undefined && { maxAge: state.maxAge }),
    page: state.page ?? DEFAULT_PLAYERS_PAGE,
    pageSize: PLAYERS_FIXED_PAGE_SIZE,
  };
  return new URLSearchParams(
    Object.entries(entries)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  );
}

export async function getPlayers(
  state: PlayersListRouteState,
  options?: { signal?: AbortSignal },
): Promise<PaginatedPlayersResponse> {
  const params = serializeApiQuery(state);
  const origin = playersApiOrigin();
  const res = await fetch(`${origin}/players?${params}`, {
    cache: 'no-store',
    signal: options?.signal,
  });
  if (!res.ok) throw new Error('Failed to fetch players');
  return res.json();
}

export async function getPlayersFilterOptions(): Promise<PlayersFilterOptions> {
  const origin = playersApiOrigin();
  try {
    const res = await fetch(`${origin}/players/filter-options`, { cache: 'no-store' });
    if (!res.ok) return { nationalities: [] };
    const data: unknown = await res.json();
    if (
      typeof data !== 'object' ||
      data === null ||
      !Array.isArray((data as PlayersFilterOptions).nationalities)
    ) {
      return { nationalities: [] };
    }
    return data as PlayersFilterOptions;
  } catch {
    return { nationalities: [] };
  }
}
