import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ConfigType } from '@nestjs/config';
import elasticConfig from '../config/elastic.config';
import {
  AggregationsAggregationContainer,
  BulkOperationType,
  IndicesCreateRequest,
} from '@elastic/elasticsearch/lib/api/types';
import { Logger } from 'winston';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { ResponseError } from '@elastic/transport/lib/errors';
import { AppNotFoundException } from '@app/core/error-handling/exceptions/app-not-found.exception';
import { AppBadRequestException } from '@app/core/error-handling/exceptions/app-bad-request.exception';

@Injectable()
export class ElasticSearchService extends Client {
  constructor(
    @Inject(elasticConfig.KEY)
    private readonly config: ConfigType<typeof elasticConfig>,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {
    super(config.elasticSearch);
  }

  async checkOrCreateIndex(def: IndicesCreateRequest) {
    try {
      if (await this.indices.exists({ index: def.index })) {
        this.logger.info('Index already exists', {
          type: 'ES_INDEX_EXISTS',
          index: def.index,
        });
        const { acknowledged } = await this.indices.putMapping({
          index: def.index,
          properties: def.mappings?.properties,
        });
        if (acknowledged) {
          this.logger.info('Updated index mapping', {
            type: 'ES_INDEX_UPDATED',
            index: def.index,
          });
        } else {
          this.logger.warn('Update index mapping failed', {
            type: 'ES_INDEX_UPDATE_FAILED',
            index: def.index,
          });
        }
        return;
      }
      await this.indices.create(def);
      this.logger.info('Created index', {
        type: 'ES_INDEX_CREATED',
        index: def.index,
      });
    } catch (err) {
      this.logger.error('Error checkOrCreate index', {
        type: 'ES_CHECK_OR_CREATE_INDEX_ERROR',
        err,
        index: def.index,
      });
    }
  }

  async upsertDoc<T>(
    index: string,
    data: { id: string; document: T },
  ): Promise<void> {
    await this.index<T>({
      index: index,
      id: data.id,
      document: data.document,
    });
    this.logger.info('Upsert entry', {
      type: 'ES_UPSERT_ENTRY',
      index,
      data,
    });
  }

  async upsertDocBulk<T>(
    index: string,
    data: { id: string; document: T }[],
  ): Promise<{
    successful: { id: string }[];
    failed: { id: string; retry: boolean }[];
  }> {
    const operations = data.flatMap((datum) => [
      { index: { _index: index, _id: datum.id } },
      datum.document,
    ]);
    const bulkResponse = await this.bulk<T>({ operations });
    const successful: { id: string }[] = [];
    const failed: { id: string; retry: boolean }[] = [];
    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0] as BulkOperationType;
      if (action[operation]?.error) {
        failed.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          retry: action[operation]!.status === 429,
          id: data[i].id,
        });
        this.logger.debug('Bulk upsert entry failed', {
          type: 'ES_UPSERT_ENTRIES_FAILURE',
          index,
          error: action[operation]?.error,
          data: data[i],
        });
      } else {
        successful.push({
          id: data[i].id,
        });
      }
    });
    if (failed.length) {
      this.logger.warn('Bulk upsert entries failures', {
        type: 'ES_UPSERT_ENTRIES_FAILURES',
        index,
        failed,
      });
    }
    const count = successful.length;
    this.logger.info('Bulk upsert entries', {
      type: 'ES_UPSERT_ENTRIES',
      index,
      count,
    });
    return {
      successful,
      failed,
    };
  }

  async deleteDoc(index: string, id: string): Promise<void> {
    try {
      await this.delete({
        index,
        id,
      });
    } catch (err) {
      if (err instanceof ResponseError) {
        if (err.meta.statusCode === 404) {
          this.logger.warn('Entry not found', {
            type: 'ES_ENTRY_NOT_FOUND',
            index,
            id,
          });
          throw new AppNotFoundException();
        } else if (err.meta.statusCode && err.meta.statusCode < 500) {
          this.logger.error('Failed to delete entry', {
            type: 'ES_DELETE_ENTRY_ERROR',
            index,
            id,
            err,
          });
          throw new AppBadRequestException();
        }
      }
      throw err;
    }
    this.logger.info('Deleted entry', { type: 'ES_DELETE_ENTRY', index, id });
  }

  async deleteDocBulk(
    index: string,
    ids: string[],
  ): Promise<{ successful: { id: string }[]; failed: { id: string }[] }> {
    const operations = ids.map((id) => ({
      delete: { _index: index, _id: id },
    }));
    const bulkResponse = await this.bulk({ operations });
    const successful: { id: string }[] = [];
    const failed: { id: string }[] = [];
    // The items array has the same order of the operations.
    // The presence of the `error` key indicates that the operation that we did for the doc has failed.
    bulkResponse.items.forEach((action, i) => {
      if (action.delete?.error) {
        failed.push({
          id: ids[i],
        });
      } else {
        successful.push({
          id: ids[i],
        });
      }
    });
    if (failed.length) {
      this.logger.warn('Bulk delete entries failures', {
        type: 'ES_DELETE_ENTRIES_FAILURES',
        index,
        failed,
      });
    }
    const count = successful.length;
    this.logger.info('Deleted entries', {
      type: 'ES_DELETE_ENTRIES',
      index,
      count,
    });
    return {
      successful,
      failed,
    };
  }

  /**
   * Normalizes input text to be used in query_string based search. It removes any character that might mess with the
   * search query and removes any unneeded whitespace.
   * (check https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_reserved_characters)
   * @param inputText
   */
  static normalizeQSInput(inputText: string): string {
    return inputText
      .replace(/[+\-|!(){}^"'`~*?:\\\/;@=#<>\[\]]+/g, '') // remove various special characters
      .replace(/&/g, '\\&') // escape '&' character e.g. R&&&D -> R\\&\\&\\&D
      .replace(/\/+/g, ' ') // replace various special characters with space
      .replace(/\s+/g, ' ') // replace multiple spaces with a single one
      .trim()
      .toLowerCase(); // make everything lowercase to assure that no operators are included in the term (e.g. AND, OR)
  }

  /**
   * Transforms incoming input text to a query_string (more details at https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html)
   * that is suitable for search.
   * It tries to match as many entries as possible but favors "exact" matches over "fuzzy" ones (word matching, contains matching).
   * It utilizes term boosting to favor more explicit matches over generic ones
   * https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_boosting
   *
   * The match types are categorized like this (higher boost means more important):
   * - Any lexical word matching: "blacks" (matches "black") or "golden" (boost: 2) (rule #1)
   * - Any part matching: "hor" (matches "thor") or "odi" (matches "odin") (no boost) (applied only to words with at least 3 letters) (rule #2)
   * - Any fuzzy words matching: "freyjja" (matches "freyja") (boost: 0.5) (rule #3) (applied only to words with at least 4 letters)
   *
   * @param inputText
   */
  static createQSInput(inputText: string): string {
    const normalizedInputText =
      ElasticSearchService.normalizeQSInput(inputText);
    const words = normalizedInputText.split(' ');
    if (!words.length) {
      // do nothing with empty search
      return '*';
    }
    const items: string[] = [];

    // rule #1
    const anyLexicalWordMatching = `(${words.join(' OR ')})^2`;
    items.push(anyLexicalWordMatching);

    // rule #2
    const containsWordList = words
      .filter((word) => word.length >= 3)
      .map((word) => `/.*${word}.*/`);
    if (containsWordList.length) {
      const anyContainsWordMatching = `(${containsWordList.join(' OR ')})`;
      items.push(anyContainsWordMatching);
    }

    // rule #3
    const fuzzyWords = words.filter((word) => word.length >= 4);
    if (fuzzyWords.length) {
      const fuzzyWordMatching = `(${fuzzyWords
        .map((word) => `${word}~`)
        .join(' OR ')})^0.5`;
      items.push(fuzzyWordMatching);
    }

    return items.join(' OR ');
  }

  /**
   * Utility that converts requested facets to ES aggregations.
   * @param facetsMap
   * @param [facets]
   */
  static facetsToSearch(
    facetsMap: Record<string, AggregationsAggregationContainer>,
    facets?: string[],
  ): Record<string, AggregationsAggregationContainer> | undefined {
    if (!facets) {
      return;
    }
    return facets.reduce(
      (
        aggs: Record<string, AggregationsAggregationContainer>,
        facet: string,
      ) => {
        if (facetsMap[facet]) {
          aggs[facet] = facetsMap[facet];
        }
        return aggs;
      },
      {},
    );
  }
}
