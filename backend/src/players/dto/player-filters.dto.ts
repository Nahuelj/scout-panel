import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Position } from '../../../generated/prisma/enums';

export class PlayerFiltersDto {
  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  seasonId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxAge?: number;
}
