import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginationMeta,
  type PaginatedResult,
} from '../common/pagination';
import { PlayerListQueryDto } from './dto/player-list-query.dto';
import { PlayerDetailQueryDto } from './dto/player-detail-query.dto';
import { pctToZeroTenScale } from './skillful-foot-score.util';
import {
  mapRowToPlayerListCard,
  PLAYER_LIST_SEASON_SELECT,
  type PlayerListCard,
} from './player-list-card';
import { buildPlayerListWhereContext } from './player-list-where';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findNationalitiesForListingFilters(): Promise<string[]> {
    const rows = await this.prisma.player.findMany({
      where: { nationality: { not: null } },
      select: { nationality: true },
      distinct: ['nationality'],
      orderBy: { nationality: 'asc' },
    });
    return rows
      .map((r) => r.nationality)
      .filter((x): x is string => x != null && x.length > 0);
  }

  async findFilterOptionsForListing(): Promise<{ nationalities: string[] }> {
    const nationalities = await this.findNationalitiesForListingFilters();
    return { nationalities };
  }

  async findAll(
    query: PlayerListQueryDto,
  ): Promise<PaginatedResult<PlayerListCard>> {
    const whereCtx = buildPlayerListWhereContext(query);
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
          select: PLAYER_LIST_SEASON_SELECT,
        },
      },
      orderBy: { name: 'asc' },
      skip,
      take: pageSize,
    });

    const data = rows.map((player) => mapRowToPlayerListCard(player));
    return { data, meta };
  }
}
