import { apiFetch, apiFetchServer, ApiError } from '@/lib/api-client';
import type { PaginatedPlayersResponse } from '@/features/players/types/player.types';
import {
  serializePlayersListApiQuery,
  type PlayersListRouteState,
} from '@/features/players/utils/player-list-params';

type ShortlistIdsResponse = { playerIds: string[] };

export async function fetchShortlistPlayerIds(
  options?: { signal?: AbortSignal },
): Promise<string[]> {
  try {
    const body = await apiFetch<ShortlistIdsResponse>('/shortlist/player-ids', {
      signal: options?.signal,
    });
    return Array.isArray(body.playerIds) ? body.playerIds : [];
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return [];
    throw err;
  }
}

export async function fetchShortlistServer(
  cookieHeader: string,
  routeState: PlayersListRouteState,
): Promise<PaginatedPlayersResponse | null> {
  const params = serializePlayersListApiQuery(routeState);
  try {
    return await apiFetchServer<PaginatedPlayersResponse>(
      `/shortlist?${params}`,
      cookieHeader,
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

export async function fetchShortlistPlayerIdsServer(
  cookieHeader: string,
): Promise<string[]> {
  try {
    const body = await apiFetchServer<ShortlistIdsResponse>(
      '/shortlist/player-ids',
      cookieHeader,
    );
    return Array.isArray(body.playerIds) ? body.playerIds : [];
  } catch {
    return [];
  }
}

export async function addToShortlist(playerId: string): Promise<void> {
  await apiFetch('/shortlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId }),
    parseJson: false,
  });
}

export async function removeFromShortlist(playerId: string): Promise<void> {
  await apiFetch(`/shortlist/${encodeURIComponent(playerId)}`, {
    method: 'DELETE',
    parseJson: false,
  });
}
