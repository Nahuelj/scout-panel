import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayerFiltersDto } from './dto/player-filters.dto';
import { PlayerDetailQueryDto } from './dto/player-detail-query.dto';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  findAll(@Query() filters: PlayerFiltersDto) {
    return this.playersService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: PlayerDetailQueryDto) {
    return this.playersService.findOne(id, query);
  }
}
