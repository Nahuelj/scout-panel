import { IsNotEmpty, IsString } from 'class-validator';

export class AddShortlistDto {
  @IsString()
  @IsNotEmpty()
  playerId!: string;
}
