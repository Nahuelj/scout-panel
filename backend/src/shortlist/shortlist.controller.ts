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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import type { AuthedSessionUser } from '../common/request-auth.types';
import { PlayerListQueryDto } from '../players/dto/player-list-query.dto';
import { PlayerListCardDto } from '../players/dto/player-list-card.dto';
import { AddShortlistDto } from './dto/add-shortlist.dto';
import { ShortlistPlayerIdsDto } from './dto/shortlist-player-ids.dto';
import { ShortlistService } from './shortlist.service';

@ApiTags('shortlist')
@ApiBearerAuth('bearer')
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'Missing or invalid token.',
})
@Controller('shortlist')
@UseGuards(AuthGuard)
export class ShortlistController {
  constructor(private readonly shortlistService: ShortlistService) {}

  @Get('player-ids')
  @ApiOperation({
    summary: 'List all shortlisted player ids for the current user',
  })
  @ApiOkResponse({ type: ShortlistPlayerIdsDto })
  playerIds(@CurrentUser() user: AuthedSessionUser) {
    return this.shortlistService
      .playerIdsForUser(user.id)
      .then((playerIds) => ({ playerIds }));
  }

  @Get()
  @ApiOperation({ summary: 'Paginated list of shortlisted players' })
  @ApiPaginatedResponse(PlayerListCardDto)
  list(
    @CurrentUser() user: AuthedSessionUser,
    @Query() query: PlayerListQueryDto,
  ) {
    return this.shortlistService.findAllForUser(user.id, query);
  }

  @Post()
  @HttpCode(204)
  @ApiOperation({ summary: 'Add a player to the current user shortlist' })
  @ApiNoContentResponse({ description: 'Player added (or already present).' })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Player not found',
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Shortlist size limit reached.',
  })
  add(@CurrentUser() user: AuthedSessionUser, @Body() body: AddShortlistDto) {
    return this.shortlistService.add(user.id, body.playerId);
  }

  @Delete(':playerId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a player from the current user shortlist' })
  @ApiNoContentResponse({ description: 'Player removed (idempotent).' })
  remove(
    @CurrentUser() user: AuthedSessionUser,
    @Param('playerId') playerId: string,
  ) {
    return this.shortlistService.remove(user.id, playerId);
  }
}
