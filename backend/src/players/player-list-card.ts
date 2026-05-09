import type { Position } from '../../generated/prisma/enums';

export const PLAYER_LIST_SEASON_SELECT = {
  club: {
    select: {
      name: true,
      league: true,
      logoUrl: true,
    },
  },
  stats: {
    select: {
      matchesPlayed: true,
      goals: true,
      assists: true,
      xGPer90: true,
    },
  },
} as const;

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

export type PlayerListCardRow = {
  id: string;
  name: string;
  photoUrl: string | null;
  position: Position;
  nationality: string | null;
  birthDate: Date | null;
  seasons: Array<{
    club: { name: string; league: string | null; logoUrl: string | null };
    stats: {
      matchesPlayed: number;
      goals: number;
      assists: number;
      xGPer90: number | null;
    } | null;
  }>;
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
