import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlayerFiltersDto } from './dto/player-filters.dto';
import { PlayerDetailQueryDto } from './dto/player-detail-query.dto';

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
            stats: {
              select: {
                matchesPlayed: true,
                minutesPlayed: true,
                goals: true,
                assists: true,
                yellowCards: true,
                redCards: true,
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
            stats: season.stats,
          }
        : null,
    };
  }

  async findAll(filters: PlayerFiltersDto) {
    const { position, nationality, seasonId, clubId, search } = filters;

    const seasonWhere = seasonId
      ? { seasonId }
      : { season: { isCurrent: true } };

    const playerSeasonWhere = {
      ...seasonWhere,
      ...(clubId && { clubId }),
    };

    const players = await this.prisma.player.findMany({
      where: {
        ...(position && { position }),
        ...(nationality && { nationality }),
        ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
        seasons: { some: playerSeasonWhere },
      },
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
    });

    return players.map((player) => {
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
  }
}
