import { Inject, Injectable } from '@nestjs/common';
import { Cats } from '../dto/cats.dto';
import { SearchCatsQuery } from '../interfaces/search-cats-query.interface';
import { ElasticSearchService } from '@app/core/elastic/services/elastic-search.service';
import {
  AggregationsAggregate,
  AggregationsAggregationContainer,
  QueryDslQueryContainer,
  SearchRequest,
  Sort,
} from '@elastic/elasticsearch/lib/api/types';
import { catsIndex } from '../indices/cats.index';
import { SearchCatsOrderBy } from '../enums/search-cats-order-by.enum';
import { SearchCatsFacet } from '../enums/search-cats-facet.enum';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { Logger } from 'winston';
import { SearchCat } from '../interfaces/search-cat.interface';
import { Cat } from '../dto/cat.dto';
import { CatsFacets } from '../dto/cats-facets.dto';

@Injectable()
export class CatsSearchService {
  constructor(
    @Inject(LOGGER) private logger: Logger,
    private es: ElasticSearchService,
  ) {}

  async findAll(query: SearchCatsQuery): Promise<Cats> {
    const { page, limit, orderBy, facets, count, q, age, gender, colors } =
      query;
    const must: QueryDslQueryContainer[] = [];
    if (q) {
      must.push({
        query_string: {
          query: ElasticSearchService.createQSInput(q),
          fields: ['name^2', 'colors^0.3'],
        },
      });
    }

    // filters creation
    const filter: QueryDslQueryContainer[] = [];
    if (age) {
      filter.push({
        range: {
          age: {
            gte: age.from,
            lte: age.to,
          },
        },
      });
    }
    if (gender) {
      filter.push({
        terms: {
          gender,
        },
      });
    }
    if (colors) {
      filter.push({
        terms: {
          colors,
        },
      });
    }

    const request: SearchRequest = {
      index: catsIndex.index,
      query: {
        bool: {
          must,
          filter,
        },
      },
      sort: CatsSearchService.orderByToSearch(orderBy),
      aggregations: ElasticSearchService.facetsToSearch(
        CatsSearchService.facetsMap,
        facets,
      ),
      from: page * limit,
      size: limit,
      rest_total_hits_as_int: false,
      track_total_hits: count,
      track_scores: true,
    };
    const { hits, aggregations } = await this.es.search<
      SearchCat,
      Record<SearchCatsFacet, AggregationsAggregate>
    >(request);
    const total: number =
      typeof hits.total === 'object' ? hits.total.value : hits.total || 0;
    this.logger.debug('Search cats result', {
      type: 'SEARCH_CATS_RESULTS',
      hits,
      query,
      request,
    });
    return {
      items: hits.hits.map((hit) => ({
        ...Cat.fromSearch(hit._id, hit._source!),
        score: hit._score || 0,
      })),
      limit,
      count: total,
      pages: Math.ceil(total / limit),
      facets: aggregations && CatsFacets.fromSearch(aggregations),
    };
  }

  /**
   * Utility that converts incoming query "order by" to search format
   * @param [orderBy]
   */
  static orderByToSearch(orderBy?: SearchCatsOrderBy): Sort {
    switch (orderBy) {
      case SearchCatsOrderBy.oldest:
        return [{ age: { order: 'desc' } }];
      case SearchCatsOrderBy.youngest:
        return [{ age: { order: 'asc' } }];
      case SearchCatsOrderBy.name_asc:
        return [{ 'name.raw': { order: 'asc' } }];
      case SearchCatsOrderBy.name_desc:
        return [{ 'name.raw': { order: 'desc' } }];
      case SearchCatsOrderBy.relevance: // default
      default:
        return []; // elastic search by default orders by matching score desc
    }
  }

  /**
   * Map useful mapping requested facets with corresponding ES aggregations.
   */
  static facetsMap: Record<SearchCatsFacet, AggregationsAggregationContainer> =
    {
      [SearchCatsFacet.colors]: {
        terms: { field: 'colors.raw' },
      },
    };
}
