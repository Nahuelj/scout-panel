import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthedSessionUser } from '../common/request-auth.types';
import { PlayerListQueryDto } from '../players/dto/player-list-query.dto';
import { AddShortlistDto } from './dto/add-shortlist.dto';
import { ShortlistService } from './shortlist.service';

@Controller('shortlist')
@UseGuards(AuthGuard)
export class ShortlistController {
  constructor(private readonly shortlistService: ShortlistService) {}

  @Get('player-ids')
  playerIds(@CurrentUser() user: AuthedSessionUser) {
    return this.shortlistService.playerIdsForUser(user.id).then((playerIds) => ({
      playerIds,
    }));
  }

  @Get()
  list(@CurrentUser() user: AuthedSessionUser, @Query() query: PlayerListQueryDto) {
    return this.shortlistService.findAllForUser(user.id, query);
  }

  @Post()
  @HttpCode(204)
  add(@CurrentUser() user: AuthedSessionUser, @Body() body: AddShortlistDto) {
    return this.shortlistService.add(user.id, body.playerId);
  }

  @Delete(':playerId')
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthedSessionUser,
    @Param('playerId') playerId: string,
  ) {
    return this.shortlistService.remove(user.id, playerId);
  }
}
