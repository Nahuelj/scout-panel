import {
  playersApiOrigin,
  type PaginatedPlayersResponse,
} from '@/lib/players-api';
import {
  serializePlayersListApiQuery,
  type PlayersListRouteState,
} from '@/lib/player-list-params';

type ShortlistIdsResponse = { playerIds: string[] };

function credentialedInit(init?: RequestInit): RequestInit {
  return { ...init, credentials: 'include' };
}

export async function fetchShortlistPlayerIds(
  options?: { signal?: AbortSignal },
): Promise<string[]> {
  const origin = playersApiOrigin();
  const res = await fetch(`${origin}/shortlist/player-ids`, credentialedInit({ signal: options?.signal }));
  if (res.status === 401) return [];
  if (!res.ok) throw new Error('Failed to fetch shortlist ids');
  const body = (await res.json()) as ShortlistIdsResponse;
  return Array.isArray(body.playerIds) ? body.playerIds : [];
}

export async function fetchShortlistServer(
  cookieHeader: string,
  routeState: PlayersListRouteState,
): Promise<PaginatedPlayersResponse | null> {
  const origin = playersApiOrigin();
  const params = serializePlayersListApiQuery(routeState);
  const res = await fetch(`${origin}/shortlist?${params}`, {
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Failed to fetch shortlist');
  return res.json() as Promise<PaginatedPlayersResponse>;
}

export async function fetchShortlistPlayerIdsServer(cookieHeader: string): Promise<string[]> {
  const origin = playersApiOrigin();
  const res = await fetch(`${origin}/shortlist/player-ids`, {
    headers: { Cookie: cookieHeader },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const body = (await res.json()) as ShortlistIdsResponse;
  return Array.isArray(body.playerIds) ? body.playerIds : [];
}

export async function addToShortlist(playerId: string): Promise<void> {
  const origin = playersApiOrigin();
  const res = await fetch(`${origin}/shortlist`, {
    ...credentialedInit(),
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId }),
  });
  if (!res.ok) throw new Error('Failed to add to shortlist');
}

export async function removeFromShortlist(playerId: string): Promise<void> {
  const origin = playersApiOrigin();
  const res = await fetch(`${origin}/shortlist/${encodeURIComponent(playerId)}`, {
    ...credentialedInit(),
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove from shortlist');
}
