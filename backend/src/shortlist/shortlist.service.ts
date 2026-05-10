import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { PaginatedResult } from '../common/pagination/pagination.helper';
import { PlayerListQueryDto } from '../players/dto/player-list-query.dto';
import { PlayersListReadService } from '../players/players-list-read.service';
import type { PlayerListCard } from '../players/mappers/player-list-card.mapper';

const MAX_SHORTLIST_ENTRIES = 200;

@Injectable()
export class ShortlistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly playersListReadService: PlayersListReadService,
  ) {}

  findAllForUser(
    userId: string,
    query: PlayerListQueryDto,
  ): Promise<PaginatedResult<PlayerListCard>> {
    return this.playersListReadService.findShortlistedForUser(userId, query);
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
