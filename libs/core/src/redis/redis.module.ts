import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import redisConfig, { REDIS_CONFIG_KEY } from './config/redis.config';
import { RedisService } from './redis.service';

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
  imports: [ConfigModule.forFeature(redisConfig)],
  providers: [redisMicroserviceFactory, RedisService],
  exports: [redisMicroserviceFactory, RedisService],
})
export class RedisModule {}
