import { ApiProperty } from '@nestjs/swagger';
import { Position, PreferredFoot } from '@prisma/client';

export class PlayerDetailStatsDto {
  @ApiProperty() matchesPlayed!: number;
  @ApiProperty() minutesPlayed!: number;
  @ApiProperty() goals!: number;
  @ApiProperty() assists!: number;
  @ApiProperty() yellowCards!: number;
  @ApiProperty() redCards!: number;

  @ApiProperty({ nullable: true }) matchesPerYellowCard!: number | null;
  @ApiProperty({ nullable: true }) matchesPerRedCard!: number | null;

  @ApiProperty({ nullable: true }) dribblesAttempted!: number | null;
  @ApiProperty({ nullable: true }) dribbleSuccessPct!: number | null;
  @ApiProperty({ nullable: true }) progressiveCarries!: number | null;
  @ApiProperty({ nullable: true }) carriesIntoFinalThird!: number | null;
  @ApiProperty({ nullable: true }) ballRetentionPct!: number | null;
  @ApiProperty({ nullable: true }) foulsWon!: number | null;

  @ApiProperty({ nullable: true }) topSpeed!: number | null;
  @ApiProperty({ nullable: true }) sprintDistance!: number | null;
  @ApiProperty({ nullable: true }) accelerations!: number | null;
  @ApiProperty({ nullable: true }) progressiveRuns!: number | null;
  @ApiProperty({ nullable: true }) distanceCovered!: number | null;

  @ApiProperty({ nullable: true }) passAccuracyPct!: number | null;
  @ApiProperty({ nullable: true }) progressivePasses!: number | null;
  @ApiProperty({ nullable: true }) keyPasses!: number | null;
  @ApiProperty({ nullable: true }) throughBalls!: number | null;
  @ApiProperty({ nullable: true }) crossAccuracyPct!: number | null;
  @ApiProperty({ nullable: true }) xA!: number | null;
  @ApiProperty({ nullable: true }) weakFootPassPct!: number | null;
  @ApiProperty({ nullable: true }) weakFootPassAccuracyPct!: number | null;
  @ApiProperty({ nullable: true }) progressiveWfPasses!: number | null;
  @ApiProperty({
    nullable: true,
    description: 'Computed from passAccuracyPct, scaled to 0-10.',
  })
  skillfulFootPassScore!: number | null;

  @ApiProperty({ nullable: true }) goalsPer90!: number | null;
  @ApiProperty({ nullable: true }) xGPer90!: number | null;
  @ApiProperty({ nullable: true }) shotAccuracyPct!: number | null;
  @ApiProperty({ nullable: true }) conversionRatePct!: number | null;
  @ApiProperty({ nullable: true }) shotsOnTarget!: number | null;
  @ApiProperty({ nullable: true }) touchesInBox!: number | null;
  @ApiProperty({ nullable: true }) weakFootShotPct!: number | null;
  @ApiProperty({ nullable: true }) weakFootGoals!: number | null;
  @ApiProperty({ nullable: true }) weakFootShotAccuracyPct!: number | null;
  @ApiProperty({
    nullable: true,
    description: 'Computed from shotAccuracyPct, scaled to 0-10.',
  })
  skillfulFootShotScore!: number | null;

  @ApiProperty({ nullable: true }) tacklesWonPct!: number | null;
  @ApiProperty({ nullable: true }) interceptions!: number | null;
  @ApiProperty({ nullable: true }) recoveries!: number | null;
  @ApiProperty({ nullable: true }) blocks!: number | null;
  @ApiProperty({ nullable: true }) aerialDuelsWonPct!: number | null;
  @ApiProperty({ nullable: true }) clearances!: number | null;

  @ApiProperty({ nullable: true }) physicalDuelsWonPct!: number | null;
  @ApiProperty({ nullable: true }) strengthDuels!: number | null;
  @ApiProperty({ nullable: true }) balance!: number | null;
  @ApiProperty({ nullable: true }) stamina!: number | null;
  @ApiProperty({ nullable: true }) bodyContactSuccessPct!: number | null;
}

export class PlayerDetailSeasonRefDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() isCurrent!: boolean;
}

export class PlayerDetailClubDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) shortName!: string | null;
  @ApiProperty({ nullable: true }) league!: string | null;
  @ApiProperty() country!: string;
  @ApiProperty({ nullable: true }) logoUrl!: string | null;
}

export class PlayerActivityEntryDto {
  @ApiProperty({ type: String, format: 'date-time' })
  monthDate!: Date;

  @ApiProperty()
  minutesPlayed!: number;
}

export class PlayerDetailCurrentSeasonDto {
  @ApiProperty({ type: () => PlayerDetailSeasonRefDto })
  season!: PlayerDetailSeasonRefDto;

  @ApiProperty({ type: () => PlayerDetailClubDto })
  club!: PlayerDetailClubDto;

  @ApiProperty({ nullable: true })
  shirtNumber!: number | null;

  @ApiProperty({ type: String, format: 'date', nullable: true })
  contractStart!: Date | null;

  @ApiProperty({ type: String, format: 'date', nullable: true })
  contractEnd!: Date | null;

  @ApiProperty({ type: () => PlayerDetailStatsDto, nullable: true })
  stats!: PlayerDetailStatsDto | null;

  @ApiProperty({ type: () => [PlayerActivityEntryDto] })
  activity!: PlayerActivityEntryDto[];
}

export class PlayerDetailDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) photoUrl!: string | null;

  @ApiProperty({ enum: Position, enumName: 'Position' })
  position!: Position;

  @ApiProperty({ nullable: true }) nationality!: string | null;

  @ApiProperty({ type: String, format: 'date', nullable: true })
  birthDate!: Date | null;

  @ApiProperty({ nullable: true }) height!: number | null;
  @ApiProperty({ nullable: true }) weight!: number | null;

  @ApiProperty({ enum: PreferredFoot, enumName: 'PreferredFoot', nullable: true })
  preferredFoot!: PreferredFoot | null;

  @ApiProperty({ type: () => PlayerDetailCurrentSeasonDto, nullable: true })
  currentSeason!: PlayerDetailCurrentSeasonDto | null;
}
