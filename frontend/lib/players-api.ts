import {
  serializePlayersListApiQuery,
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

function coerceServerLoopbackOrigin(url: string): string {
  if (typeof window !== 'undefined') return url;
  try {
    const u = new URL(url);
    if (u.hostname === 'localhost') {
      u.hostname = '127.0.0.1';
    }
    return u.origin;
  } catch {
    return url;
  }
}

export function playersApiOrigin(): string {
  const configured =
    typeof process.env.NEXT_PUBLIC_API_URL === 'string'
      ? process.env.NEXT_PUBLIC_API_URL.trim()
      : '';

  const base =
    configured.length > 0
      ? configured.replace(/\/$/, '')
      : typeof window === 'undefined'
        ? 'http://127.0.0.1:8080'
        : 'http://localhost:8080';

  return coerceServerLoopbackOrigin(base);
}

export async function getPlayers(
  state: PlayersListRouteState,
  options?: { signal?: AbortSignal },
): Promise<PaginatedPlayersResponse> {
  const params = serializePlayersListApiQuery(state);
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
