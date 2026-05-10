import { apiFetch, ApiError } from '@/lib/api-client';
import type { PlayerDetail } from '@/features/players/types/player.types';

export async function getPlayerDetail(
  id: string,
  seasonId?: string,
): Promise<PlayerDetail | null> {
  const params = seasonId ? `?seasonId=${seasonId}` : '';
  try {
    return await apiFetch<PlayerDetail>(`/players/${id}${params}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}
