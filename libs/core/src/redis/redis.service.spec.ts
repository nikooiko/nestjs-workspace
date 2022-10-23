import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import redisConfig from './config/redis.config';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/core/logger/logger.module';

describe('RedisService', () => {
  let service: RedisService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(redisConfig), LoggerModule],
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterAll(async () => {
    service.onModuleDestroy();
  });
});
