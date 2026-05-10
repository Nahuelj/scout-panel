import { apiFetch } from '@/lib/api-client';
import {
  serializePlayersListApiQuery,
  type PlayersListRouteState,
} from '@/features/players/utils/player-list-params';
import type {
  PaginatedPlayersResponse,
  PlayersFilterOptions,
} from '@/features/players/types/player.types';

export async function getPlayers(
  state: PlayersListRouteState,
  options?: { signal?: AbortSignal },
): Promise<PaginatedPlayersResponse> {
  const params = serializePlayersListApiQuery(state);
  return apiFetch<PaginatedPlayersResponse>(`/players?${params}`, {
    signal: options?.signal,
  });
}

export async function getPlayersFilterOptions(): Promise<PlayersFilterOptions> {
  try {
    const data = await apiFetch<unknown>('/players/filter-options');
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
