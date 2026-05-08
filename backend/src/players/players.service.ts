import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginationMeta,
  type PaginatedResult,
} from '../common/pagination';
import { PlayerListQueryDto } from './dto/player-list-query.dto';
import { PlayerDetailQueryDto } from './dto/player-detail-query.dto';
import { pctToZeroTenScale } from './skillful-foot-score.util';

const SEASON_SELECT = {
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

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  private buildPlayerListWhere(
    query: Pick<
      PlayerListQueryDto,
      | 'position'
      | 'nationality'
      | 'seasonId'
      | 'clubId'
      | 'search'
      | 'league'
    >,
  ) {
    const { position, nationality, seasonId, clubId, search, league } =
      query;

    const seasonWhere = seasonId
      ? { seasonId }
      : { season: { isCurrent: true } };

    const playerSeasonWhere = {
      ...seasonWhere,
      ...(clubId && { clubId }),
      ...(league && {
        club: {
          league: {
            equals: league.trim(),
            mode: 'insensitive' as const,
          },
        },
      }),
    };

    return {
      ...(position && { position }),
      ...(nationality && { nationality }),
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
      seasons: { some: playerSeasonWhere },
      playerSeasonWhere,
    };
  }

  async findOne(id: string, query: PlayerDetailQueryDto) {
    const seasonWhere = query.seasonId
      ? { seasonId: query.seasonId }
      : { season: { isCurrent: true } };

    const player = await this.prisma.player.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        position: true,
        nationality: true,
        birthDate: true,
        height: true,
        weight: true,
        preferredFoot: true,
        seasons: {
          where: seasonWhere,
          take: 1,
          select: {
            shirtNumber: true,
            contractStart: true,
            contractEnd: true,
            season: { select: { id: true, name: true, isCurrent: true } },
            club: {
              select: {
                id: true,
                name: true,
                shortName: true,
                league: true,
                country: true,
                logoUrl: true,
              },
            },
            activity: {
              select: { monthDate: true, minutesPlayed: true },
              orderBy: { monthDate: 'asc' as const },
            },
            stats: {
              select: {
                matchesPlayed: true,
                minutesPlayed: true,
                goals: true,
                assists: true,
                yellowCards: true,
                redCards: true,
                matchesPerYellowCard: true,
                matchesPerRedCard: true,
                dribblesAttempted: true,
                dribbleSuccessPct: true,
                progressiveCarries: true,
                carriesIntoFinalThird: true,
                ballRetentionPct: true,
                foulsWon: true,
                topSpeed: true,
                sprintDistance: true,
                accelerations: true,
                progressiveRuns: true,
                distanceCovered: true,
                passAccuracyPct: true,
                progressivePasses: true,
                keyPasses: true,
                throughBalls: true,
                crossAccuracyPct: true,
                xA: true,
                weakFootPassPct: true,
                weakFootPassAccuracyPct: true,
                progressiveWfPasses: true,
                skillfulFootPassScore: true,
                goalsPer90: true,
                xGPer90: true,
                shotAccuracyPct: true,
                conversionRatePct: true,
                shotsOnTarget: true,
                touchesInBox: true,
                weakFootShotPct: true,
                weakFootGoals: true,
                weakFootShotAccuracyPct: true,
                skillfulFootShotScore: true,
                tacklesWonPct: true,
                interceptions: true,
                recoveries: true,
                blocks: true,
                aerialDuelsWonPct: true,
                clearances: true,
                physicalDuelsWonPct: true,
                strengthDuels: true,
                balance: true,
                stamina: true,
                bodyContactSuccessPct: true,
              },
            },
          },
        },
      },
    });

    if (!player) throw new NotFoundException(`Player ${id} not found`);

    const season = player.seasons[0] ?? null;

    const rawStats = season?.stats ?? null;
    const stats = rawStats
      ? {
          ...rawStats,
          skillfulFootPassScore:
            pctToZeroTenScale(rawStats.passAccuracyPct) ??
            rawStats.skillfulFootPassScore,
          skillfulFootShotScore:
            pctToZeroTenScale(rawStats.shotAccuracyPct) ??
            rawStats.skillfulFootShotScore,
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

  async findClubsForListingFilters() {
    return this.prisma.club.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: 500,
    });
  }

  async findLeaguesForListingFilters(): Promise<string[]> {
    const rows = await this.prisma.club.findMany({
      where: { league: { not: null } },
      select: { league: true },
      distinct: ['league'],
      orderBy: { league: 'asc' },
    });
    return rows
      .map((r) => r.league)
      .filter((x): x is string => x != null && x.length > 0);
  }

  async findFilterOptionsForListing(): Promise<{
    leagues: string[];
    clubs: { id: string; name: string }[];
  }> {
    const [leagues, clubs] = await Promise.all([
      this.findLeaguesForListingFilters(),
      this.findClubsForListingFilters(),
    ]);
    return { leagues, clubs };
  }

  async findAll(
    query: PlayerListQueryDto,
  ): Promise<PaginatedResult<PlayerListCard>> {
    const whereCtx = this.buildPlayerListWhere(query);
    const { playerSeasonWhere, ...where } = whereCtx;

    const rawPageSize =
      query.pageSize === undefined || Number.isNaN(query.pageSize)
        ? DEFAULT_PAGE_SIZE
        : query.pageSize;
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawPageSize));
    const requestedPage =
      query.page === undefined || Number.isNaN(query.page)
        ? DEFAULT_PAGE
        : query.page;

    const totalItems = await this.prisma.player.count({ where });
    const meta = buildPaginationMeta({
      page: requestedPage,
      pageSize,
      totalItems,
    });
    const skip = (meta.page - 1) * pageSize;

    const rows = await this.prisma.player.findMany({
      where,
      select: {
        id: true,
        name: true,
        photoUrl: true,
        position: true,
        nationality: true,
        birthDate: true,
        seasons: {
          where: playerSeasonWhere,
          take: 1,
          select: SEASON_SELECT,
        },
      },
      orderBy: { name: 'asc' },
      skip,
      take: pageSize,
    });

    const data = rows.map((player) => {
      const season = player.seasons[0] ?? null;
      return {
        id: player.id,
        name: player.name,
        photoUrl: player.photoUrl,
        position: player.position,
        nationality: player.nationality,
        birthDate: player.birthDate,
        currentSeason: season
          ? {
              club: season.club.name,
              clubLogoUrl: season.club.logoUrl,
              league: season.club.league,
              stats: season.stats,
            }
          : null,
      };
    });
    return { data, meta };
  }
}

type PlayerListCard = {
  id: string;
  name: string;
  photoUrl: string | null;
  position: string;
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
