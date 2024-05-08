import { Test, TestingModule } from '@nestjs/testing';
import { ElasticSearchService } from './elastic-search.service';
import elasticConfig from '../config/elastic.config';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/core/logger/logger.module';

describe('ElasticSearchService', () => {
  let service: ElasticSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(elasticConfig), LoggerModule],
      providers: [ElasticSearchService],
    }).compile();

    service = module.get<ElasticSearchService>(ElasticSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
