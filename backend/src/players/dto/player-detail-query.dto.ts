import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PlayerDetailQueryDto {
  @ApiPropertyOptional({
    description:
      'When omitted, the current season is returned. Otherwise, the season with the given id.',
  })
  @IsOptional()
  @IsString()
  seasonId?: string;
}
