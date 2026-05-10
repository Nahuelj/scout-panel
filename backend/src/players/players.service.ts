import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginationMeta,
  resolvePagination,
  type PaginatedResult,
} from '../common/pagination/pagination.helper';
import { PlayerListQueryDto } from './dto/player-list-query.dto';
import { PlayerDetailQueryDto } from './dto/player-detail-query.dto';
import {
  PLAYER_LIST_SELECT,
  PLAYER_LIST_SEASON_SELECT,
} from './queries/player-list.select';
import {
  PLAYER_DETAIL_SELECT,
  PLAYER_DETAIL_SEASON_SELECT,
} from './queries/player-detail.select';
import { buildPlayerListWhereContext } from './queries/player-list-where';
import {
  mapRowToPlayerListCard,
  type PlayerListCard,
} from './mappers/player-list-card.mapper';
import { mapRowToPlayerDetail } from './mappers/player-detail.mapper';

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
        ...PLAYER_DETAIL_SELECT,
        seasons: {
          where: seasonWhere,
          take: 1,
          select: PLAYER_DETAIL_SEASON_SELECT,
        },
      },
    });

    if (!player) throw new NotFoundException(`Player ${id} not found`);

    return mapRowToPlayerDetail(player);
  }

  async findFilterOptionsForListing(): Promise<{ nationalities: string[] }> {
    const nationalities = await this.findNationalitiesForListingFilters();
    return { nationalities };
  }

  async findAll(
    query: PlayerListQueryDto,
  ): Promise<PaginatedResult<PlayerListCard>> {
    const { playerWhere, seasonWhere } = buildPlayerListWhereContext(query);
    const { page, pageSize } = resolvePagination(query);

    const totalItems = await this.prisma.player.count({ where: playerWhere });
    const meta = buildPaginationMeta({ page, pageSize, totalItems });
    const skip = (meta.page - 1) * pageSize;

    const rows = await this.prisma.player.findMany({
      where: playerWhere,
      select: {
        ...PLAYER_LIST_SELECT,
        seasons: {
          where: seasonWhere,
          take: 1,
          select: PLAYER_LIST_SEASON_SELECT,
        },
      },
      orderBy: { name: 'asc' },
      skip,
      take: pageSize,
    });

    const data = rows.map(mapRowToPlayerListCard);
    return { data, meta };
  }

  private async findNationalitiesForListingFilters(): Promise<string[]> {
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
}
