import { Controller, Get, Query } from '@nestjs/common';
import { CatsSearchService } from '../services/cats-search.service';
import { GetCatsQueryDto } from '../dto/get-cats-query.dto';
import { SearchCatsQuery } from '../interfaces/search-cats-query.interface';
import { Cats } from '../dto/cats.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('cats')
@ApiTags('cats')
export class CatsSearchController {
  constructor(private catsSearch: CatsSearchService) {}

  @Get()
  @ApiOkResponse({ type: Cats })
  async findAll(@Query() query: GetCatsQueryDto): Promise<Cats> {
    const searchQuery: SearchCatsQuery = {
      q: query.q && decodeURIComponent(query.q),
      gender: query.gender,
      colors: query.colors,
      limit: query.limit,
      page: query.page,
      orderBy: query.orderBy,
      facets: query.facets,
      count: true,
    };
    if (query.age?.length === 2) {
      searchQuery.age = { from: query.age[0], to: query.age[1] };
    }
    return this.catsSearch.findAll(searchQuery);
  }
}
