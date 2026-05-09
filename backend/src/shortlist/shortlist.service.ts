import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildPaginationMeta } from '../common/pagination';
import { PlayerListQueryDto } from '../players/dto/player-list-query.dto';
import {
  mapRowToPlayerListCard,
  PLAYER_LIST_SEASON_SELECT,
  type PlayerListCard,
} from '../players/player-list-card';
import { buildPlayerListWhereContext } from '../players/player-list-where';

const MAX_SHORTLIST_ENTRIES = 200;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

@Injectable()
export class ShortlistService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(
    userId: string,
    query: PlayerListQueryDto,
  ): Promise<{ data: PlayerListCard[]; meta: ReturnType<typeof buildPaginationMeta> }> {
    const whereCtx = buildPlayerListWhereContext(query);
    const { playerSeasonWhere, ...playerWhere } = whereCtx;

    const baseShortlistWhere = {
      userId,
      player: playerWhere,
    };

    const rawPageSize =
      query.pageSize === undefined || Number.isNaN(query.pageSize)
        ? DEFAULT_PAGE_SIZE
        : query.pageSize;
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawPageSize));
    const requestedPage =
      query.page === undefined || Number.isNaN(query.page)
        ? DEFAULT_PAGE
        : query.page;

    const totalItems = await this.prisma.shortlistEntry.count({
      where: baseShortlistWhere,
    });
    const meta = buildPaginationMeta({
      page: requestedPage,
      pageSize,
      totalItems,
    });
    const skip = (meta.page - 1) * pageSize;

    const entries = await this.prisma.shortlistEntry.findMany({
      where: baseShortlistWhere,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        player: {
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
        },
      },
    });
    const data = entries.map((e) => mapRowToPlayerListCard(e.player));
    return { data, meta };
  }

  async playerIdsForUser(userId: string): Promise<string[]> {
    const entries = await this.prisma.shortlistEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: MAX_SHORTLIST_ENTRIES,
      select: { playerId: true },
    });
    return entries.map((e) => e.playerId);
  }

  async add(userId: string, playerId: string): Promise<void> {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { id: true },
    });
    if (!player) throw new NotFoundException(`Player ${playerId} not found`);

    const existing = await this.prisma.shortlistEntry.findUnique({
      where: { userId_playerId: { userId, playerId } },
    });
    if (existing) return;

    const count = await this.prisma.shortlistEntry.count({ where: { userId } });
    if (count >= MAX_SHORTLIST_ENTRIES) {
      throw new BadRequestException(
        `Shortlist cannot exceed ${MAX_SHORTLIST_ENTRIES} players`,
      );
    }

    await this.prisma.shortlistEntry.create({
      data: { userId, playerId },
    });
  }

  async remove(userId: string, playerId: string): Promise<void> {
    await this.prisma.shortlistEntry.deleteMany({
      where: { userId, playerId },
    });
  }
}
