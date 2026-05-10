import type { Position, Prisma } from '@prisma/client';
import {
  PLAYER_LIST_SELECT,
  PLAYER_LIST_SEASON_SELECT,
} from '../queries/player-list.select';

export type PlayerListCardRow = Prisma.PlayerGetPayload<{
  select: typeof PLAYER_LIST_SELECT & {
    seasons: { select: typeof PLAYER_LIST_SEASON_SELECT };
  };
}>;

export type PlayerListCard = {
  id: string;
  name: string;
  photoUrl: string | null;
  position: Position;
  nationality: string | null;
  birthDate: Date | null;
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

export function mapRowToPlayerListCard(row: PlayerListCardRow): PlayerListCard {
  const season = row.seasons[0] ?? null;
  return {
    id: row.id,
    name: row.name,
    photoUrl: row.photoUrl,
    position: row.position,
    nationality: row.nationality,
    birthDate: row.birthDate,
    currentSeason: season
      ? {
          club: season.club.name,
          clubLogoUrl: season.club.logoUrl,
          league: season.club.league,
          stats: season.stats,
        }
      : null,
  };
}
