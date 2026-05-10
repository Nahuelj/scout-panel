import { IntersectionType } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { PlayerFiltersDto } from './player-filters.dto';

export class PlayerListQueryDto extends IntersectionType(
  PlayerFiltersDto,
  PaginationQueryDto,
) {}
