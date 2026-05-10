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

function formatPlayersApiConnectionError(url: string, cause: unknown): Error {
  const detail = cause instanceof Error ? cause.message : String(cause);
  const message = [
    'Cannot reach the players API.',
    'Start the Nest backend (e.g. pnpm dev in backend/) on the port you use (default 8080),',
    'or set NEXT_PUBLIC_API_URL in frontend/.env.local to the API base URL (no trailing slash).',
    `Request: ${url}`,
    `Detail: ${detail}`,
  ].join(' ');
  return new Error(message, { cause });
}

export async function getPlayers(
  state: PlayersListRouteState,
  options?: { signal?: AbortSignal },
): Promise<PaginatedPlayersResponse> {
  const params = serializePlayersListApiQuery(state);
  const origin = playersApiOrigin();
  const url = `${origin}/players?${params}`;
  let res: Response;
  try {
    res = await fetch(url, {
      cache: 'no-store',
      signal: options?.signal,
    });
  } catch (err) {
    throw formatPlayersApiConnectionError(url, err);
  }
  if (!res.ok) {
    const body = await res.text();
    const detail = body.length > 500 ? `${body.slice(0, 500)}…` : body;
    throw new Error(
      `Failed to fetch players (${res.status} ${res.statusText}). ${detail}`.trim(),
    );
  }
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
