import { ApiPropertyOptional } from '@nestjs/swagger';
import { AggregationsAggregate } from '@elastic/elasticsearch/lib/api/types';
import { SearchCatsFacet } from '../enums/search-cats-facet.enum';
import { SearchKeywordFacet } from '@app/core/elastic/dto/search-keyword-facet.dto';

export class CatsFacets {
  @ApiPropertyOptional({ type: [SearchKeywordFacet] })
  colors?: SearchKeywordFacet[];

  static fromSearch(
    aggregations: Record<SearchCatsFacet, AggregationsAggregate>,
  ): CatsFacets {
    return Object.entries(aggregations).reduce(
      (facets: CatsFacets, [facet, data]) => {
        if (facet === SearchCatsFacet.colors && 'buckets' in data) {
          facets.colors = SearchKeywordFacet.fromSearch(data);
        }
        return facets;
      },
      {},
    );
  }
}
