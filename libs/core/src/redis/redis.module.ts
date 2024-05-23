import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { LoggerModule } from '../logger/logger.module';
import redisConfig, { REDIS_CONFIG_KEY } from './config/redis.config';
import { RedisService } from './services/redis.service';
import { RedisCountSemaphoreService } from '@app/core/redis/services/redis-count-semaphore.service';

export const REDIS_MICROSERVICE_KEY = 'redis-microservice';

const redisMicroserviceFactory = {
  provide: REDIS_MICROSERVICE_KEY,
  useFactory: (configService: ConfigService) => {
    const config =
      configService.get<ConfigType<typeof redisConfig>>(REDIS_CONFIG_KEY);
    return ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        ...config,
      },
    });
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule.forFeature(redisConfig), LoggerModule],
  providers: [
    redisMicroserviceFactory,
    RedisService,
    RedisCountSemaphoreService,
  ],
  exports: [redisMicroserviceFactory, RedisService, RedisCountSemaphoreService],
})
export class RedisModule {}
