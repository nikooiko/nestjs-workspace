import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Cat } from './cat.dto';
import { PagedListDto } from '@app/core/pagination/dto/paged-list.dto';
import { CatsFacets } from './cats-facets.dto';

export class Cats extends PagedListDto {
  @ApiProperty({ type: [Cat] })
  items: Cat[];

  @ApiPropertyOptional({ type: CatsFacets })
  facets?: CatsFacets;
}
