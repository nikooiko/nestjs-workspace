import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from '@app/core/redis/redis.module';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { RedisService } from '@app/core/redis/redis.service';
import rateLimitConfig, {
  RATE_LIMIT_CONFIG_KEY,
} from './config/rate-limit.config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerBehindProxyGuard } from '@app/core/rate-limit/guards/throttler-behind-proxy.guard';

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
