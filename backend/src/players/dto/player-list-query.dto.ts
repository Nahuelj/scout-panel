import { Type } from 'class-transformer';
import { IsInt, Max, Min, IsOptional } from 'class-validator';
import { PlayerFiltersDto } from './player-filters.dto';

export class PlayerListQueryDto extends PlayerFiltersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
