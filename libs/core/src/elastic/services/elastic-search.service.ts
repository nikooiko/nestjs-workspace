import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ConfigType } from '@nestjs/config';
import elasticConfig from '../config/elastic.config';
import {
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
    const bulkResponse = await this.bulk<T>({ refresh: true, operations });
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
          error: action[operation]?.error,
          data: data[i],
        });
      } else {
        successful.push({
          id: data[i].id,
        });
      }
    });
    const count = successful.length;
    this.logger.info('Bulk upsert entries', {
      type: 'ES_UPSERT_ENTRIES',
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
            id,
          });
          throw new AppNotFoundException();
        } else if (err.meta.statusCode && err.meta.statusCode < 500) {
          this.logger.error('Failed to delete entry', {
            type: 'ES_DELETE_ENTRY_ERROR',
            id,
            err,
          });
          throw new AppBadRequestException();
        }
      }
      throw err;
    }
    this.logger.info('Deleted entry', { type: 'ES_DELETE_ENTRY', id });
  }

  async deleteDocBulk(
    index: string,
    ids: string[],
  ): Promise<{ successful: { id: string }[]; failed: { id: string }[] }> {
    const operations = ids.map((id) => ({
      delete: { _index: index, _id: id },
    }));
    const bulkResponse = await this.bulk({ refresh: true, operations });
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
        failed,
      });
    }
    const count = successful.length;
    this.logger.info('Deleted entries', {
      type: 'ES_DELETE_ENTRIES',
      count,
    });
    return {
      successful,
      failed,
    };
  }
}
