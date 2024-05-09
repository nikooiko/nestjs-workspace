import { ApiProperty } from '@nestjs/swagger';
import { AggregationsAggregate } from '@elastic/elasticsearch/lib/api/types';

export class SearchKeywordFacet {
  @ApiProperty()
  key: string;

  @ApiProperty()
  count: number;

  static fromSearch(aggregations: AggregationsAggregate): SearchKeywordFacet[] {
    const buckets: SearchKeywordFacet[] = [];
    if ('buckets' in aggregations && Array.isArray(aggregations.buckets)) {
      buckets.push(
        ...aggregations.buckets.map((bucket) => ({
          key: bucket.key,
          count: bucket.doc_count,
        })),
      );
    }
    return buckets;
  }
}
