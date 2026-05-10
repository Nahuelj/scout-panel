import { ApiProperty } from '@nestjs/swagger';
import { Position } from '@prisma/client';

export class PlayerListCardStatsDto {
  @ApiProperty({ example: 38 })
  matchesPlayed!: number;

  @ApiProperty({ example: 14 })
  goals!: number;

  @ApiProperty({ example: 5 })
  assists!: number;

  @ApiProperty({
    example: 0.55,
    description: 'Expected Goals per 90 minutes',
    nullable: true,
  })
  xGPer90!: number | null;
}

export class PlayerListCardCurrentSeasonDto {
  @ApiProperty({ example: 'Boca Juniors' })
  club!: string;

  @ApiProperty({ nullable: true })
  clubLogoUrl!: string | null;

  @ApiProperty({ nullable: true })
  league!: string | null;

  @ApiProperty({ type: () => PlayerListCardStatsDto, nullable: true })
  stats!: PlayerListCardStatsDto | null;
}

export class PlayerListCardDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  photoUrl!: string | null;

  @ApiProperty({ enum: Position, enumName: 'Position' })
  position!: Position;

  @ApiProperty({ nullable: true })
  nationality!: string | null;

  @ApiProperty({ type: String, format: 'date', nullable: true })
  birthDate!: Date | null;

  @ApiProperty({ type: () => PlayerListCardCurrentSeasonDto, nullable: true })
  currentSeason!: PlayerListCardCurrentSeasonDto | null;
}
