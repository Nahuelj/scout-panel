import { IsOptional, IsString } from 'class-validator';

export class PlayerDetailQueryDto {
  @IsOptional()
  @IsString()
  seasonId?: string;
}
