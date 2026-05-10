import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddShortlistDto {
  @ApiProperty({ example: 'boca-merentiel-001' })
  @IsString()
  @IsNotEmpty()
  playerId!: string;
}
