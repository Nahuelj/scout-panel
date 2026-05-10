import { ApiProperty } from '@nestjs/swagger';

export class FilterOptionsDto {
  @ApiProperty({ type: [String], example: ['Argentina', 'Spain', 'Uruguay'] })
  nationalities!: string[];
}
