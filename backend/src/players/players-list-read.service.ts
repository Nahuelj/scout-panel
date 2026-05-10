import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPaginationMeta,
  resolvePagination,
  type PaginatedResult,
} from '../common/pagination/pagination.helper';
import { PlayerListQueryDto } from './dto/player-list-query.dto';
import {
  PLAYER_LIST_SELECT,
  PLAYER_LIST_SEASON_SELECT,
} from './queries/player-list.select';
import { buildPlayerListWhereContext } from './queries/player-list-where';
import {
  mapRowToPlayerListCard,
  type PlayerListCard,
} from './mappers/player-list-card.mapper';

@Injectable()
export class PlayersListReadService {
  constructor(private readonly prisma: PrismaService) {}

  async findShortlistedForUser(
    userId: string,
    query: PlayerListQueryDto,
  ): Promise<PaginatedResult<PlayerListCard>> {
    const { playerWhere, seasonWhere } = buildPlayerListWhereContext(query);
    const shortlistWhere: Prisma.ShortlistEntryWhereInput = {
      userId,
      player: playerWhere,
    };

    const { page, pageSize } = resolvePagination(query);

    const totalItems = await this.prisma.shortlistEntry.count({
      where: shortlistWhere,
    });
    const meta = buildPaginationMeta({ page, pageSize, totalItems });
    const skip = (meta.page - 1) * pageSize;

    const entries = await this.prisma.shortlistEntry.findMany({
      where: shortlistWhere,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        player: {
          select: {
            ...PLAYER_LIST_SELECT,
            seasons: {
              where: seasonWhere,
              take: 1,
              select: PLAYER_LIST_SEASON_SELECT,
            },
          },
        },
      },
    });

    const data = entries.map((e) => mapRowToPlayerListCard(e.player));
    return { data, meta };
  }
}
