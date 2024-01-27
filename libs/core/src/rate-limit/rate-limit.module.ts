import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import rateLimitConfig, {
  RATE_LIMIT_CONFIG_KEY,
} from './config/rate-limit.config';
import { ThrottlerBehindProxyGuard } from './guards/throttler-behind-proxy.guard';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/services/redis.service';

@Module({
  imports: [
    ConfigModule.forFeature(rateLimitConfig),
    RedisModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, RedisModule],
      inject: [ConfigService, RedisService],
      useFactory: (
        configService: ConfigService,
        redisService: RedisService,
      ) => {
        const config = configService.get<ConfigType<typeof rateLimitConfig>>(
          RATE_LIMIT_CONFIG_KEY,
        );
        if (!config) {
          throw new Error('Rate limit configuration is not defined');
        }
        return {
          ttl: config.ttl,
          limit: config.limit,
          storage: new ThrottlerStorageRedisService(redisService),
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class RateLimitModule {}
