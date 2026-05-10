import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PlayersModule } from '../players/players.module';
import { ShortlistController } from './shortlist.controller';
import { ShortlistService } from './shortlist.service';

@Module({
  imports: [AuthModule, PlayersModule],
  controllers: [ShortlistController],
  providers: [ShortlistService],
})
export class ShortlistModule {}
