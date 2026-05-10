import type { Prisma } from '@prisma/client';
import type { PlayerFiltersDto } from '../dto/player-filters.dto';

export type PlayerListWhereContext = {
  playerWhere: Prisma.PlayerWhereInput;
  seasonWhere: Prisma.PlayerSeasonWhereInput;
};

export function buildPlayerListWhereContext(
  query: PlayerFiltersDto,
): PlayerListWhereContext {
  const { position, nationality, seasonId, search, minAge, maxAge } = query;

  const seasonWhere: Prisma.PlayerSeasonWhereInput = seasonId
    ? { seasonId }
    : { season: { isCurrent: true } };

  const today = new Date();
  const birthDateFilter: { lte?: Date; gte?: Date } = {};
  if (minAge !== undefined) {
    const lte = new Date(today);
    lte.setFullYear(lte.getFullYear() - minAge);
    birthDateFilter.lte = lte;
  }
  if (maxAge !== undefined) {
    const gte = new Date(today);
    gte.setFullYear(gte.getFullYear() - maxAge - 1);
    gte.setDate(gte.getDate() + 1);
    birthDateFilter.gte = gte;
  }
  const hasBirthDateFilter = Object.keys(birthDateFilter).length > 0;

  const playerWhere: Prisma.PlayerWhereInput = {
    ...(position && { position }),
    ...(nationality && { nationality }),
    ...(search && {
      name: { contains: search, mode: 'insensitive' as const },
    }),
    ...(hasBirthDateFilter && { birthDate: birthDateFilter }),
    seasons: { some: seasonWhere },
  };

  return { playerWhere, seasonWhere };
}
