import { IsEnum, IsOptional, IsString } from 'class-validator';
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
  clubId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
