import { ApiProperty } from '@nestjs/swagger';

export class ShortlistPlayerIdsDto {
  @ApiProperty({ type: [String], example: ['boca-merentiel-001'] })
  playerIds!: string[];
}
