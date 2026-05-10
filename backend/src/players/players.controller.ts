import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { PlayersService } from './players.service';
import { PlayerListQueryDto } from './dto/player-list-query.dto';
import { PlayerDetailQueryDto } from './dto/player-detail-query.dto';
import { PlayerListCardDto } from './dto/player-list-card.dto';
import { PlayerDetailDto } from './dto/player-detail.dto';
import { FilterOptionsDto } from './dto/filter-options.dto';

@ApiTags('players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('filter-options')
  @ApiOperation({ summary: 'Distinct values usable to filter the player list' })
  @ApiOkResponse({ type: FilterOptionsDto })
  filterOptionsForListing() {
    return this.playersService.findFilterOptionsForListing();
  }

  @Get()
  @ApiOperation({ summary: 'List players with filters and pagination' })
  @ApiPaginatedResponse(PlayerListCardDto)
  findAll(@Query() query: PlayerListQueryDto) {
    return this.playersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get player detail by id' })
  @ApiOkResponse({ type: PlayerDetailDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'Player not found' })
  findOne(@Param('id') id: string, @Query() query: PlayerDetailQueryDto) {
    return this.playersService.findOne(id, query);
  }
}
