import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ElasticSearchService } from './services/elastic-search.service';
import { LOGGER } from '@app/core/logger/factories/logger.factory';
import { Logger } from 'winston';
import { ConfigModule } from '@nestjs/config';
import elasticConfig from './config/elastic.config';

@Module({
  imports: [ConfigModule.forFeature(elasticConfig)],
  providers: [ElasticSearchService],
  exports: [ElasticSearchService],
})
export class ElasticModule implements OnApplicationBootstrap {
  constructor(@Inject(LOGGER) private logger: Logger) {}

  async onApplicationBootstrap() {
    this.logger.info('Elastic bootstrap success!', {
      type: 'ELASTIC_BOOTSTRAP',
    });
  }
}
