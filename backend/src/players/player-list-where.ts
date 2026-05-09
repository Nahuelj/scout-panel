import type { PlayerListQueryDto } from './dto/player-list-query.dto';

export type PlayerListFilterInput = Pick<
  PlayerListQueryDto,
  'position' | 'nationality' | 'seasonId' | 'search' | 'minAge' | 'maxAge'
>;

export type PlayerListWhereContext = {
  position?: PlayerListFilterInput['position'];
  nationality?: string;
  name?: { contains: string; mode: 'insensitive' };
  birthDate?: { lte?: Date; gte?: Date };
  seasons: { some: Record<string, unknown> };
  playerSeasonWhere: Record<string, unknown>;
};

export function buildPlayerListWhereContext(
  query: PlayerListFilterInput,
): PlayerListWhereContext {
  const { position, nationality, seasonId, search, minAge, maxAge } = query;

  const seasonWhere = seasonId
    ? { seasonId }
    : { season: { isCurrent: true } };

  const playerSeasonWhere = { ...seasonWhere };

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

  return {
    ...(position && { position }),
    ...(nationality && { nationality }),
    ...(search && {
      name: { contains: search, mode: 'insensitive' as const },
    }),
    ...(hasBirthDateFilter && { birthDate: birthDateFilter }),
    seasons: { some: playerSeasonWhere },
    playerSeasonWhere,
  };
}
