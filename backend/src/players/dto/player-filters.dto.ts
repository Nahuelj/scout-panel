import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Position } from '@prisma/client';

export class PlayerFiltersDto {
  @ApiPropertyOptional({ enum: Position, enumName: 'Position' })
  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @ApiPropertyOptional({ example: 'Argentina' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Restrict to a specific season id.' })
  @IsOptional()
  @IsString()
  seasonId?: string;

  @ApiPropertyOptional({ description: 'Case-insensitive name search.' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minAge?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxAge?: number;
}
