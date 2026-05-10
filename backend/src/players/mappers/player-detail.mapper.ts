import type { Prisma } from '@prisma/client';
import { pctToZeroTenScale } from '../utils/skillful-foot-score.util';
import {
  PLAYER_DETAIL_SELECT,
  PLAYER_DETAIL_SEASON_SELECT,
} from '../queries/player-detail.select';

export type PlayerDetailRow = Prisma.PlayerGetPayload<{
  select: typeof PLAYER_DETAIL_SELECT & {
    seasons: { select: typeof PLAYER_DETAIL_SEASON_SELECT };
  };
}>;

export type PlayerDetailRawSeason = PlayerDetailRow['seasons'][number];
export type PlayerDetailRawStats = NonNullable<PlayerDetailRawSeason['stats']>;

export type PlayerDetailStats = PlayerDetailRawStats & {
  matchesPerYellowCard: number | null;
  matchesPerRedCard: number | null;
  skillfulFootPassScore: number | null;
  skillfulFootShotScore: number | null;
};

/**
 * Maps a raw Prisma player row to the full player detail shape.
 * Computes derived stats (matchesPerYellowCard, matchesPerRedCard, skillfulFootScores)
 * and returns currentSeason as null when no seasons are present.
 */
export function mapRowToPlayerDetail(player: PlayerDetailRow) {
  const season = player.seasons[0] ?? null;
  const rawStats = season?.stats ?? null;
  const stats: PlayerDetailStats | null = rawStats
    ? {
        ...rawStats,
        matchesPerYellowCard:
          rawStats.matchesPlayed > 0 && rawStats.yellowCards > 0
            ? rawStats.matchesPlayed / rawStats.yellowCards
            : null,
        matchesPerRedCard:
          rawStats.matchesPlayed > 0 && rawStats.redCards > 0
            ? rawStats.matchesPlayed / rawStats.redCards
            : null,
        skillfulFootPassScore: pctToZeroTenScale(rawStats.passAccuracyPct),
        skillfulFootShotScore: pctToZeroTenScale(rawStats.shotAccuracyPct),
      }
    : null;

  return {
    id: player.id,
    name: player.name,
    photoUrl: player.photoUrl,
    position: player.position,
    nationality: player.nationality,
    birthDate: player.birthDate,
    height: player.height,
    weight: player.weight,
    preferredFoot: player.preferredFoot,
    currentSeason: season
      ? {
          season: season.season,
          club: season.club,
          shirtNumber: season.shirtNumber,
          contractStart: season.contractStart,
          contractEnd: season.contractEnd,
          stats,
          activity: season.activity,
        }
      : null,
  };
}
