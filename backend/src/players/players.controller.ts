import { Controller, Get, Param, Query } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayerListQueryDto } from './dto/player-list-query.dto';
import { PlayerDetailQueryDto } from './dto/player-detail-query.dto';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('filter-options')
  filterOptionsForListing() {
    return this.playersService.findFilterOptionsForListing();
  }

  @Get()
  findAll(@Query() query: PlayerListQueryDto) {
    return this.playersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: PlayerDetailQueryDto) {
    return this.playersService.findOne(id, query);
  }
}
