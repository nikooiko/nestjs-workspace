import { Inject, Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { ConfigType } from '@nestjs/config';
import elasticConfig from '../config/elastic.config';
import { IndicesCreateRequest } from '@elastic/elasticsearch/lib/api/types';
import { Logger } from 'winston';
import { LOGGER } from '@app/core/logger/factories/logger.factory';

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
}
