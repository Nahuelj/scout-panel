import { Module } from '@nestjs/common';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { PlayersListReadService } from './players-list-read.service';

@Module({
  controllers: [PlayersController],
  providers: [PlayersService, PlayersListReadService],
  exports: [PlayersListReadService],
})
export class PlayersModule {}
